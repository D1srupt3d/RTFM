// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { marked } = require('marked');
const matter = require('gray-matter');
const { glob } = require('glob');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

const app = express();
const PORT = process.env.PORT || 3000;
const DOCS_DIR = path.join(__dirname, 'docs');
const DOCS_REPO = process.env.DOCS_REPO || '';
const GITHUB_PAT = process.env.GITHUB_PAT || '';
const DOCS_BRANCH = process.env.DOCS_BRANCH || 'main';

// Build authenticated repo URL if PAT is provided
function getAuthenticatedRepoUrl() {
    if (!DOCS_REPO) return '';
    
    // If PAT is provided and repo is HTTPS, inject it
    if (GITHUB_PAT && DOCS_REPO.startsWith('https://')) {
        // Insert PAT after https://
        return DOCS_REPO.replace('https://', `https://${GITHUB_PAT}@`);
    }
    
    return DOCS_REPO;
}

// Load configuration (hybrid: env vars + config.js)
let config = {};
try {
    config = require('./config.js');
    console.log('✅ Loaded config.js');
} catch (error) {
    // Use defaults if config.js doesn't exist
    config = {
        site: { title: 'RTFM', tagline: 'Read The F***ing Manual', logo: '📚' },
        links: {}
    };
}

// Environment variables override config.js
if (process.env.SITE_TITLE) config.site.title = process.env.SITE_TITLE;
if (process.env.SITE_TAGLINE) config.site.tagline = process.env.SITE_TAGLINE;
if (process.env.SITE_LOGO) config.site.logo = process.env.SITE_LOGO;
if (process.env.GITHUB_LINK) config.links.github = process.env.GITHUB_LINK;

// Initialize docs repository on startup
async function initDocsRepo() {
    try {
        const exists = await fs.access(DOCS_DIR).then(() => true).catch(() => false);
        const isGitRepo = exists && await fs.access(path.join(DOCS_DIR, '.git')).then(() => true).catch(() => false);
        
        // Check if directory is empty (Docker creates it as empty when volume is first mounted)
        let isEmpty = false;
        if (exists && !isGitRepo) {
            const files = await fs.readdir(DOCS_DIR);
            isEmpty = files.length === 0;
        }
        
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

        const authRepoUrl = getAuthenticatedRepoUrl();
        const repoDisplay = DOCS_REPO.replace(/https:\/\/.*@/, 'https://***@'); // Hide PAT in logs

        if (isGitRepo) {
            console.log('📁 Docs directory exists, pulling latest changes...');
            const { stdout } = await execPromise(`cd ${DOCS_DIR} && git pull origin ${DOCS_BRANCH}`);
            console.log('✅ Docs updated:', stdout.trim());
            
            // Show current commit
            const { stdout: commitHash } = await execPromise(`cd ${DOCS_DIR} && git rev-parse --short HEAD`);
            const { stdout: commitMsg } = await execPromise(`cd ${DOCS_DIR} && git log -1 --pretty=%B`);
            console.log(`📌 Current commit: ${commitHash.trim()} - ${commitMsg.trim().split('\n')[0]}`);
        } else if (exists && !isEmpty) {
            throw new Error('Docs directory exists but is not a git repository. Please run: docker-compose down -v');
        } else {
            console.log(`📦 Cloning docs from ${repoDisplay}...`);
            const { stdout } = await execPromise(`git clone -b ${DOCS_BRANCH} ${authRepoUrl} ${DOCS_DIR}`);
            console.log('✅ Docs cloned successfully');
            
            // Show cloned commit
            const { stdout: commitHash } = await execPromise(`cd ${DOCS_DIR} && git rev-parse --short HEAD`);
            const { stdout: commitMsg } = await execPromise(`cd ${DOCS_DIR} && git log -1 --pretty=%B`);
            console.log(`📌 Cloned commit: ${commitHash.trim()} - ${commitMsg.trim().split('\n')[0]}`);
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
app.use(express.static('public'));

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
        // Skip index.md and README.md from navigation
        if (file === 'index.md' || file === 'README.md') {
            continue;
        }
        
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
        
        // Get last modified timestamp
        let lastModified = null;
        try {
            const { stdout } = await execPromise(`cd ${DOCS_DIR} && git log -1 --format=%cd --date=relative -- "${filePath}.md"`);
            lastModified = stdout.trim();
        } catch (error) {
            // If git fails, file might be new or not in repo
            console.error(`Could not get last modified time for ${filePath}:`, error.message);
        }
        
        return {
            frontmatter,
            html,
            title: frontmatter.title || path.basename(filePath).replace(/-/g, ' '),
            lastModified
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

app.get('/api/commit', async (req, res) => {
    try {
        const { stdout: hash } = await execPromise(`cd ${DOCS_DIR} && git rev-parse --short HEAD`);
        const { stdout: message } = await execPromise(`cd ${DOCS_DIR} && git log -1 --pretty=%s`);
        const { stdout: date } = await execPromise(`cd ${DOCS_DIR} && git log -1 --pretty=%cr`);
        
        res.json({
            hash: hash.trim(),
            message: message.trim(),
            date: date.trim()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get commit info' });
    }
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

// Catch-all route for SPA - serve index.html for all non-API routes
app.get('*', (req, res) => {
    // Don't redirect API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // For SPA routing with clean URLs, always serve index.html
    // The frontend will handle the routing via History API
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
async function start() {
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
