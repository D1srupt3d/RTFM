const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { marked } = require('marked');
const matter = require('gray-matter');
const { glob } = require('glob');
const { exec } = require('child_process');
const util = require('util');
const rateLimit = require('express-rate-limit');

const execPromise = util.promisify(exec);

const app = express();
const PORT = process.env.PORT || 3000;
const DOCS_DIR = path.join(__dirname, 'docs');
const DOCS_REPO = process.env.DOCS_REPO || '';
const DOCS_BRANCH = process.env.DOCS_BRANCH || 'main';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'change-me-in-production';

// Load configuration
let config = {};
async function loadConfig() {
    try {
        // Try custom config first (mounted volume)
        let configPath = path.join(__dirname, 'config.json');
        let configExists = await fs.access(configPath).then(() => true).catch(() => false);
        
        if (configExists) {
            const configFile = await fs.readFile(configPath, 'utf-8');
            config = JSON.parse(configFile);
            console.log('✅ Loaded custom config.json');
        } else {
            // Fall back to default config
            configPath = path.join(__dirname, 'config.example.json');
            configExists = await fs.access(configPath).then(() => true).catch(() => false);
            
            if (configExists) {
                const configFile = await fs.readFile(configPath, 'utf-8');
                config = JSON.parse(configFile);
                console.log('ℹ️  Using default configuration');
            } else {
                throw new Error('No configuration file found');
            }
        }
    } catch (error) {
        console.error('❌ Error loading config:', error.message);
        config = {
            site: { title: 'RTFM', tagline: 'Read The Friendly Manual', logo: '📚' },
            links: {}
        };
    }
}

// Initialize docs repository on startup
async function initDocsRepo() {
    try {
        const exists = await fs.access(DOCS_DIR).then(() => true).catch(() => false);
        
        if (!DOCS_REPO) {
            console.log('⚠️  No DOCS_REPO configured. Please set DOCS_REPO environment variable.');
            console.log('   Example: DOCS_REPO=https://github.com/user/docs.git');
            
            if (!exists) {
                console.log('📁 Creating empty docs directory...');
                await fs.mkdir(DOCS_DIR, { recursive: true });
                await fs.writeFile(
                    path.join(DOCS_DIR, 'index.md'),
                    '# Welcome\n\nPlease configure DOCS_REPO environment variable to clone your documentation repository.'
                );
            }
            return;
        }

        if (exists) {
            console.log('📁 Docs directory exists, pulling latest changes...');
            const { stdout } = await execPromise(`cd ${DOCS_DIR} && git pull origin ${DOCS_BRANCH}`);
            console.log('✅ Docs updated:', stdout.trim());
        } else {
            console.log(`📦 Cloning docs from ${DOCS_REPO}...`);
            const { stdout } = await execPromise(`git clone -b ${DOCS_BRANCH} ${DOCS_REPO} ${DOCS_DIR}`);
            console.log('✅ Docs cloned successfully');
        }
    } catch (error) {
        console.error('❌ Error initializing docs repository:', error.message);
        console.error('   Make sure DOCS_REPO is a valid git repository URL');
        
        // Create empty docs directory with error message
        await fs.mkdir(DOCS_DIR, { recursive: true });
        await fs.writeFile(
            path.join(DOCS_DIR, 'index.md'),
            `# Configuration Error\n\nFailed to clone documentation repository.\n\n**Error:** ${error.message}\n\nPlease check your DOCS_REPO configuration.`
        );
    }
}

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Rate limiting for webhook
const webhookLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10 // limit each IP to 10 requests per windowMs
});

// Configure marked
marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: true,
    mangle: false
});

// Helper function to get all markdown files
async function getMarkdownFiles() {
    try {
        const files = await glob('**/*.md', { cwd: DOCS_DIR });
        return files.sort();
    } catch (error) {
        console.error('Error reading markdown files:', error);
        return [];
    }
}

// Helper function to build navigation tree
async function buildNavTree() {
    const files = await getMarkdownFiles();
    const tree = [];

    for (const file of files) {
        const parts = file.split('/');
        const fileName = parts[parts.length - 1];
        const title = fileName.replace('.md', '').replace(/-/g, ' ');
        
        let current = tree;
        for (let i = 0; i < parts.length - 1; i++) {
            const dirName = parts[i];
            let dir = current.find(item => item.name === dirName && item.type === 'dir');
            if (!dir) {
                dir = {
                    type: 'dir',
                    name: dirName,
                    title: dirName.replace(/-/g, ' '),
                    children: []
                };
                current.push(dir);
            }
            current = dir.children;
        }
        
        current.push({
            type: 'file',
            name: fileName,
            title: title,
            path: file.replace('.md', '')
        });
    }

    return tree;
}

// Helper function to read and parse markdown file
async function getMarkdownContent(filePath) {
    try {
        const fullPath = path.join(DOCS_DIR, filePath + '.md');
        const content = await fs.readFile(fullPath, 'utf-8');
        const { data: frontmatter, content: markdown } = matter(content);
        const html = marked(markdown);
        
        return {
            frontmatter,
            html,
            title: frontmatter.title || path.basename(filePath).replace(/-/g, ' ')
        };
    } catch (error) {
        throw new Error(`Document not found: ${filePath}`);
    }
}

// Search function
async function searchDocs(query) {
    const files = await getMarkdownFiles();
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const file of files) {
        try {
            const fullPath = path.join(DOCS_DIR, file);
            const content = await fs.readFile(fullPath, 'utf-8');
            const { data: frontmatter, content: markdown } = matter(content);
            
            const title = frontmatter.title || file.replace('.md', '').replace(/-/g, ' ');
            const lines = markdown.split('\n');
            
            // Check title
            if (title.toLowerCase().includes(lowerQuery)) {
                results.push({
                    title,
                    path: file.replace('.md', ''),
                    preview: lines.slice(0, 3).join(' ').substring(0, 200)
                });
                continue;
            }
            
            // Check content
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].toLowerCase().includes(lowerQuery)) {
                    const start = Math.max(0, i - 1);
                    const end = Math.min(lines.length, i + 2);
                    results.push({
                        title,
                        path: file.replace('.md', ''),
                        preview: lines.slice(start, end).join(' ').substring(0, 200)
                    });
                    break;
                }
            }
        } catch (error) {
            console.error(`Error searching file ${file}:`, error);
        }
    }

    return results;
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/config', (req, res) => {
    res.json({
        site: config.site,
        links: config.links
    });
});

app.get('/api/nav', async (req, res) => {
    try {
        const tree = await buildNavTree();
        res.json(tree);
    } catch (error) {
        res.status(500).json({ error: 'Failed to build navigation' });
    }
});

app.get('/api/doc/*', async (req, res) => {
    try {
        const docPath = req.params[0];
        const doc = await getMarkdownContent(docPath);
        res.json(doc);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query || query.length < 2) {
            return res.json([]);
        }
        const results = await searchDocs(query);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});

// GitHub webhook endpoint
app.post('/webhook/github', webhookLimiter, async (req, res) => {
    try {
        // Basic secret verification
        const secret = req.headers['x-webhook-secret'];
        
        if (secret !== WEBHOOK_SECRET) {
            console.log('Webhook: Invalid secret');
            return res.status(401).json({ error: 'Invalid secret' });
        }

        const event = req.headers['x-github-event'];
        
        // Only process push and pull_request events
        if (event === 'push' || event === 'pull_request') {
            console.log(`🔄 Webhook received: ${event}`);
            
            // Pull latest changes from docs repo
            const { stdout, stderr } = await execPromise(`cd ${DOCS_DIR} && git pull origin ${DOCS_BRANCH}`);
            console.log('✅ Docs updated:', stdout.trim());
            if (stderr) console.error('Git stderr:', stderr);
            
            res.json({ success: true, message: 'Documentation updated' });
        } else {
            res.json({ success: true, message: 'Event ignored' });
        }
    } catch (error) {
        console.error('❌ Webhook error:', error);
        res.status(500).json({ error: 'Failed to update documentation' });
    }
});

// Start server
async function start() {
    await loadConfig();
    await initDocsRepo();
    app.listen(PORT, () => {
        console.log(`\n📚 ${config.site?.title || 'RTFM'} - Documentation Server`);
        console.log(`🌐 Running on http://localhost:${PORT}`);
        console.log(`📁 Serving docs from: ${DOCS_DIR}`);
        if (DOCS_REPO) {
            console.log(`📦 Docs repo: ${DOCS_REPO}`);
        }
    });
}

start().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
