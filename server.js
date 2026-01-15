require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const matter = require('gray-matter');
const { glob } = require('glob');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// Dynamic import for marked (ES module) - must be loaded before server starts
let marked;
async function initMarked() {
    const markedModule = await import('marked');
    marked = markedModule.marked;
    
    // Configure marked with custom renderer for proper language classes
    const renderer = new markedModule.marked.Renderer();
    renderer.code = function(token) {
        // In marked v17+, code receives a token object with: text, lang, escaped
        const code = token.text || token;
        const lang = token.lang || '';
        
        const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        
        if (lang) {
            return `<pre><code class="language-${lang}">${escapedCode}</code></pre>`;
        }
        return `<pre><code>${escapedCode}</code></pre>`;
    };
    
    marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false,
        renderer: renderer
    });
}

const app = express();
const PORT = process.env.PORT || 3000;
const DOCS_DIR = path.join(__dirname, 'docs');
const DOCS_REPO = process.env.DOCS_REPO || '';
const GITHUB_PAT = process.env.GITHUB_PAT || '';
const DOCS_BRANCH = process.env.DOCS_BRANCH || 'main';

function getAuthenticatedRepoUrl() {
    if (!DOCS_REPO) return '';
    if (GITHUB_PAT && DOCS_REPO.startsWith('https://')) {
        return DOCS_REPO.replace('https://', `https://${GITHUB_PAT}@`);
    }
    return DOCS_REPO;
}

let config = {};
try {
    config = require('./config.js');
} catch (error) {
    config = {
        site: { title: 'RTFM', tagline: 'Read The F***ing Manual', logo: '📚' },
        links: {}
    };
}
if (process.env.SITE_TITLE) config.site.title = process.env.SITE_TITLE;
if (process.env.SITE_TAGLINE) config.site.tagline = process.env.SITE_TAGLINE;
if (process.env.SITE_LOGO) config.site.logo = process.env.SITE_LOGO;
if (process.env.GITHUB_LINK) config.links.github = process.env.GITHUB_LINK;

async function initDocsRepo() {
    try {
        const exists = await fs.access(DOCS_DIR).then(() => true).catch(() => false);
        const isGitRepo = exists && await fs.access(path.join(DOCS_DIR, '.git')).then(() => true).catch(() => false);
        let isEmpty = false;
        if (exists && !isGitRepo) {
            const files = await fs.readdir(DOCS_DIR);
            isEmpty = files.length === 0;
        }
        
        if (!DOCS_REPO) {
            console.log('No DOCS_REPO configured - using example docs');
            const exampleDocsDir = path.join(__dirname, 'example-docs');
            const exampleExists = await fs.access(exampleDocsDir).then(() => true).catch(() => false);
            
            if (exampleExists && !exists) {
                // Copy example-docs to docs for demo purposes
                await fs.mkdir(DOCS_DIR, { recursive: true });
                const files = await glob('**/*', { cwd: exampleDocsDir, nodir: true });
                for (const file of files) {
                    const srcPath = path.join(exampleDocsDir, file);
                    const destPath = path.join(DOCS_DIR, file);
                    await fs.mkdir(path.dirname(destPath), { recursive: true });
                    await fs.copyFile(srcPath, destPath);
                }
                console.log('Copied example docs to docs/');
            } else if (!exists) {
                await fs.mkdir(DOCS_DIR, { recursive: true });
                await fs.writeFile(
                    path.join(DOCS_DIR, 'index.md'),
                    '# Welcome\n\nConfigure DOCS_REPO to load your docs.'
                );
            }
            return;
        }

        const authRepoUrl = getAuthenticatedRepoUrl();
        const repoDisplay = DOCS_REPO.replace(/https:\/\/.*@/, 'https://***@');

        if (isGitRepo) {
            await execPromise(`cd ${DOCS_DIR} && git pull origin ${DOCS_BRANCH}`);
            const { stdout: hash } = await execPromise(`cd ${DOCS_DIR} && git rev-parse --short HEAD`);
            const { stdout: msg } = await execPromise(`cd ${DOCS_DIR} && git log -1 --pretty=%B`);
            console.log(`Pulled latest: ${hash.trim()} - ${msg.trim().split('\n')[0]}`);
        } else if (exists && !isEmpty) {
            throw new Error('Docs directory exists but is not a git repo');
        } else {
            await execPromise(`git clone -b ${DOCS_BRANCH} ${authRepoUrl} ${DOCS_DIR}`);
            const { stdout: hash } = await execPromise(`cd ${DOCS_DIR} && git rev-parse --short HEAD`);
            console.log(`Cloned: ${hash.trim()}`);
        }
    } catch (error) {
        console.error('Failed to init docs:', error.message);
        await fs.mkdir(DOCS_DIR, { recursive: true });
        await fs.writeFile(
            path.join(DOCS_DIR, 'index.md'),
            `# Error\n\nFailed to clone docs.\n\n${error.message}`
        );
    }
}

app.use(express.static('public', { maxAge: '1h' }));

async function getMarkdownFiles() {
    try {
        const files = await glob('**/*.md', { cwd: DOCS_DIR });
        return files.sort();
    } catch (error) {
        console.error('Error reading markdown files:', error);
        return [];
    }
}

async function buildNavTree() {
    const files = await getMarkdownFiles();
    const tree = [];

    for (const file of files) {
        if (file === 'index.md' || file === 'README.md') continue;
        
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

async function getMarkdownContent(filePath) {
    try {
        const fullPath = path.join(DOCS_DIR, filePath + '.md');
        const content = await fs.readFile(fullPath, 'utf-8');
        const { data: frontmatter, content: markdown } = matter(content);
        const html = marked(markdown);
        let lastModified = null;
        try {
            const { stdout } = await execPromise(`cd ${DOCS_DIR} && git log -1 --format=%cd --date=relative -- "${filePath}.md"`);
            lastModified = stdout.trim();
        } catch (error) {}
        
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
            
            if (title.toLowerCase().includes(lowerQuery)) {
                results.push({
                    title,
                    path: file.replace('.md', ''),
                    preview: lines.slice(0, 3).join(' ').substring(0, 200)
                });
                continue;
            }
            
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

app.get('/api/doc/*path', async (req, res) => {
    try {
        // In Express 5, wildcards must be named and return arrays
        const docPath = Array.isArray(req.params.path) ? req.params.path.join('/') : req.params.path;
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

app.get('/*catchall', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Not found' });
    }
    const ext = path.extname(req.path);
    if (ext && ['.js', '.css', '.png', '.jpg', '.ico', '.svg', '.woff', '.woff2', '.ttf'].includes(ext)) {
        return res.status(404).send('Not found');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function start() {
    await initMarked();
    await initDocsRepo();
    app.listen(PORT, () => {
        console.log(`${config.site?.title || 'RTFM'} running on port ${PORT}`);
    });
}

start().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
