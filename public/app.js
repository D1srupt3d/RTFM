// State
let navData = [];
let currentDoc = null;
let searchTimeout = null;
let config = {};

// Initialize app
async function init() {
    await loadConfig();
    await loadNavigation();
    setupEventListeners();
    
    // Load initial doc from URL hash, index, or first doc
    const hash = window.location.hash.slice(1);
    if (hash) {
        loadDocument(hash);
    } else {
        // Try to load index.md first, fall back to first document
        const indexExists = await fetch('/api/doc/index').then(r => r.ok).catch(() => false);
        
        if (indexExists) {
            loadDocument('index');
        } else if (navData.length > 0) {
            const firstDoc = findFirstDocument(navData);
            if (firstDoc) {
                loadDocument(firstDoc.path);
            }
        }
    }
}

// Load configuration
async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        config = await response.json();
        applyConfig();
    } catch (error) {
        console.error('Failed to load config:', error);
        config = {
            site: { title: 'RTFM', tagline: 'Documentation', logo: '📚' },
            links: {}
        };
    }
}

// Apply configuration to UI
function applyConfig() {
    // Apply site branding
    document.getElementById('site-title').textContent = config.site?.title || 'RTFM';
    document.getElementById('site-tagline').textContent = config.site?.tagline || 'Documentation';
    document.getElementById('logo-icon').textContent = config.site?.logo || '📚';
    document.title = config.site?.title || 'RTFM';
    
    // Add custom links to footer
    const footer = document.getElementById('sidebar-footer');
    footer.innerHTML = '';
    
    if (config.links) {
        if (config.links.github) {
            const githubLink = document.createElement('a');
            githubLink.href = config.links.github;
            githubLink.target = '_blank';
            githubLink.rel = 'noopener noreferrer';
            githubLink.className = 'sidebar-link';
            githubLink.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
            `;
            footer.appendChild(githubLink);
        }
        
        if (config.links.custom && Array.isArray(config.links.custom)) {
            config.links.custom.forEach(link => {
                const customLink = document.createElement('a');
                customLink.href = link.url;
                customLink.textContent = link.title;
                customLink.className = 'sidebar-link';
                if (link.external) {
                    customLink.target = '_blank';
                    customLink.rel = 'noopener noreferrer';
                }
                footer.appendChild(customLink);
            });
        }
    }
    
    // Add commit info
    loadCommitInfo();
}

// Load and display latest commit info
async function loadCommitInfo() {
    try {
        const response = await fetch('/api/commit');
        const commit = await response.json();
        
        const footer = document.getElementById('sidebar-footer');
        const commitInfo = document.createElement('div');
        commitInfo.className = 'commit-info';
        commitInfo.innerHTML = `
            <div class="commit-hash">${commit.hash}</div>
            <div class="commit-date">${commit.date}</div>
        `;
        footer.appendChild(commitInfo);
    } catch (error) {
        console.error('Failed to load commit info:', error);
    }
}

// Find first document in nav tree
function findFirstDocument(items) {
    for (const item of items) {
        if (item.type === 'file') {
            return item;
        }
        if (item.children) {
            const found = findFirstDocument(item.children);
            if (found) return found;
        }
    }
    return null;
}

// Load navigation tree
async function loadNavigation() {
    try {
        const response = await fetch('/api/nav');
        navData = await response.json();
        renderNavigation(navData);
    } catch (error) {
        console.error('Failed to load navigation:', error);
        document.getElementById('nav-tree').innerHTML = '<div class="loading-nav">Failed to load navigation</div>';
    }
}

// Render navigation tree
function renderNavigation(items, parentElement = null) {
    const container = parentElement || document.getElementById('nav-tree');
    
    if (!parentElement) {
        container.innerHTML = '';
    }
    
    items.forEach(item => {
        if (item.type === 'dir') {
            const dirElement = document.createElement('div');
            dirElement.className = 'nav-item dir';
            dirElement.textContent = item.title;
            dirElement.dataset.name = item.name;
            dirElement.dataset.type = 'dir'; // Mark as directory
            
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'nav-children';
            
            dirElement.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Only toggle expand/collapse, don't navigate
                dirElement.classList.toggle('expanded');
                childrenContainer.classList.toggle('visible');
            });
            
            container.appendChild(dirElement);
            container.appendChild(childrenContainer);
            
            if (item.children) {
                renderNavigation(item.children, childrenContainer);
            }
        } else if (item.type === 'file') {
            const fileElement = document.createElement('div');
            fileElement.className = 'nav-item file';
            fileElement.textContent = item.title;
            fileElement.dataset.path = item.path;
            
            fileElement.addEventListener('click', () => {
                loadDocument(item.path);
            });
            
            container.appendChild(fileElement);
        }
    });
}

// Load document
async function loadDocument(path) {
    try {
        currentDoc = path;
        window.location.hash = path;
        
        // Update active state in nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.path === path) {
                item.classList.add('active');
                expandParents(item);
            }
        });
        
        // Update breadcrumbs
        updateBreadcrumbs(path);
        
        // Fetch document
        const response = await fetch(`/api/doc/${path}`);
        if (!response.ok) {
            throw new Error('Document not found');
        }
        
        const doc = await response.json();
        const contentElement = document.getElementById('doc-content');
        contentElement.innerHTML = doc.html;
        
        // Add copy buttons to code blocks
        addCopyButtons();
        
        // Generate table of contents
        generateTOC();
        
        // Show last modified time
        if (doc.lastModified) {
            showLastModified(doc.lastModified);
        }
        
        // Scroll to top
        document.querySelector('.content').scrollTop = 0;
        
        // Close mobile menu if open
        document.querySelector('.sidebar').classList.remove('mobile-open');
        
    } catch (error) {
        console.error('Failed to load document:', error);
        
        // If document not found, redirect to homepage
        if (error.message === 'Document not found') {
            console.log('Document not found, redirecting to homepage...');
            window.location.hash = 'index';
            loadDocument('index');
        } else {
            document.getElementById('doc-content').innerHTML = `
                <div class="error-404">
                    <div class="error-icon">📄</div>
                    <h1>Document Not Found</h1>
                    <p>The page you're looking for doesn't exist.</p>
                    <button onclick="window.location.hash='index'" class="home-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        Go Home
                    </button>
                </div>
            `;
        }
    }
}

// Update breadcrumbs
function updateBreadcrumbs(path) {
    const breadcrumbsElement = document.getElementById('breadcrumbs');
    
    // Hide breadcrumbs on homepage
    if (path === 'index') {
        breadcrumbsElement.style.display = 'none';
        return;
    }
    
    const parts = path.split('/');
    
    let html = '<div class="breadcrumb-item"><a href="#index">Home</a></div>';
    let currentPath = '';
    
    parts.forEach((part, index) => {
        currentPath += (currentPath ? '/' : '') + part;
        const isLast = index === parts.length - 1;
        const title = part.replace(/-/g, ' ');
        
        if (isLast) {
            html += `<span class="breadcrumb-separator">/</span>`;
            html += `<div class="breadcrumb-item">${title}</div>`;
        } else {
            html += `<span class="breadcrumb-separator">/</span>`;
            html += `<div class="breadcrumb-item"><a href="#${currentPath}">${title}</a></div>`;
        }
    });
    
    breadcrumbsElement.innerHTML = html;
    breadcrumbsElement.style.display = 'flex';
}

// Expand parent directories in nav
function expandParents(element) {
    let parent = element.previousElementSibling;
    while (parent) {
        if (parent.classList.contains('dir')) {
            parent.classList.add('expanded');
            const children = parent.nextElementSibling;
            if (children && children.classList.contains('nav-children')) {
                children.classList.add('visible');
            }
        }
        parent = parent.parentElement.previousElementSibling;
    }
}

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('search');
    const searchResults = document.getElementById('search-results');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    // Search
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            searchResults.classList.remove('active');
            return;
        }
        
        searchTimeout = setTimeout(() => performSearch(query), 300);
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            searchResults.classList.remove('active');
        }
    });
    
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('mobile-open') && 
            !e.target.closest('.sidebar') && 
            !e.target.closest('.mobile-menu-toggle')) {
            sidebar.classList.remove('mobile-open');
        }
    });
    
    // Handle browser back/forward
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1);
        if (hash && hash !== currentDoc) {
            loadDocument(hash);
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
        
        // Escape to close search or mobile menu
        if (e.key === 'Escape') {
            searchResults.classList.remove('active');
            searchInput.blur();
            sidebar.classList.remove('mobile-open');
        }
    });
}

// Perform search
async function performSearch(query) {
    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();
        displaySearchResults(results);
    } catch (error) {
        console.error('Search failed:', error);
    }
}

// Display search results
function displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item" style="text-align: center;">No results found</div>';
        searchResults.classList.add('active');
        return;
    }
    
    searchResults.innerHTML = results.map(result => `
        <div class="search-result-item" data-path="${result.path}">
            <div class="search-result-title">${escapeHtml(result.title)}</div>
            <div class="search-result-preview">${escapeHtml(result.preview)}</div>
        </div>
    `).join('');
    
    searchResults.classList.add('active');
    
    // Add click handlers
    searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            loadDocument(item.dataset.path);
            searchResults.classList.remove('active');
            document.getElementById('search').value = '';
        });
    });
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add copy buttons to code blocks
function addCopyButtons() {
    document.querySelectorAll('pre').forEach(pre => {
        // Skip if already has button
        if (pre.querySelector('.copy-button')) return;
        
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
        `;
        button.title = 'Copy code';
        
        button.addEventListener('click', async () => {
            const code = pre.querySelector('code').textContent;
            await navigator.clipboard.writeText(code);
            
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
            button.classList.add('copied');
            
            setTimeout(() => {
                button.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                `;
                button.classList.remove('copied');
            }, 2000);
        });
        
        pre.style.position = 'relative';
        pre.appendChild(button);
    });
}

// Generate table of contents
function generateTOC() {
    const content = document.getElementById('doc-content');
    const headings = content.querySelectorAll('h2, h3');
    
    // Remove existing TOC
    const existingTOC = document.querySelector('.toc-sidebar');
    if (existingTOC) existingTOC.remove();
    
    // Only generate if there are 6+ headings (for longer docs)
    if (headings.length < 6) return;
    
    const toc = document.createElement('div');
    toc.className = 'toc-sidebar';
    
    const tocHeader = document.createElement('div');
    tocHeader.className = 'toc-header';
    tocHeader.innerHTML = `
        <span class="toc-title">On This Page</span>
    `;
    toc.appendChild(tocHeader);
    
    const tocList = document.createElement('ul');
    tocList.className = 'toc-list';
    
    headings.forEach((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;
        
        const li = document.createElement('li');
        li.className = `toc-item toc-${heading.tagName.toLowerCase()}`;
        
        const link = document.createElement('a');
        link.href = `#${id}`;
        link.textContent = heading.textContent;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        
        li.appendChild(link);
        tocList.appendChild(li);
    });
    
    toc.appendChild(tocList);
    
    // Insert TOC as floating sidebar on the right
    document.querySelector('.content').appendChild(toc);
}

// Show last modified time
function showLastModified(time) {
    const content = document.getElementById('doc-content');
    
    // Remove existing timestamp
    const existing = content.querySelector('.last-modified');
    if (existing) existing.remove();
    
    const timestamp = document.createElement('div');
    timestamp.className = 'last-modified';
    timestamp.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        Last updated ${time}
    `;
    
    content.appendChild(timestamp);
}

// Start the app
init();
