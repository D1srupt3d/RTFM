# Roadmap

## ✅ Completed

### Core Features
- **Markdown rendering** - Full GitHub-flavored markdown support
- **Syntax highlighting** - Code blocks with Highlight.js
- **Full-text search** - Search across all documentation
- **Git integration** - Auto-pulls docs from repository on startup
- **Docker deployment** - One-command setup with Docker Compose

### Theming System
Unified site-wide themes with coordinated syntax highlighting:
- **Dark themes**: Tokyo Night (default), GitHub Dark, One Dark, Monokai, Nord, Dracula, Gruvbox, Ayu Dark
- **Light themes**: GitHub Light, Solarized Light, Material
- **Catppuccin**: Mocha, Macchiato, Frappé, Latte (all flavors)
- Theme persistence in localStorage
- Single dropdown for site + code themes

### Navigation & UX
- **Clean URLs** - No hash-based routing, proper History API
- **Breadcrumbs** - Shows document path (Home / Infrastructure / Kubernetes)
- **Auto-generated nav tree** - Folder structure becomes collapsible sidebar
- **Table of Contents** - Auto-generated for long pages (6+ headings)
- **Active highlighting** - TOC scrolls and highlights current section
- **Internal link resolution** - Markdown links (.md) work automatically
- **Browser back/forward** - Clean URL history with pushState

### Code Block Features
- **Copy buttons** - One-click copy on all code blocks
- **Collapsible blocks** - Auto-collapse for code >10 lines
- **Line preservation** - Proper formatting maintained
- **Syntax detection** - Auto-detects language from markdown

### Diagrams (v0.3.0)
- **Mermaid support** - Flowcharts, sequence diagrams, infrastructure maps
- **Theme integration** - Diagrams adapt to site theme
- **Multiple types** - Flowcharts, sequences, Gantt, ERD, state machines, timelines

### Mobile Responsive
- **Hamburger menu** - Collapsible navigation on mobile
- **Touch-friendly** - Proper tap targets and gestures
- **Responsive layout** - Works on all screen sizes
- **Adaptive TOC** - Hides on narrow screens/zoom

### Developer Experience
- **Git commit info** - Shows latest commit hash and date
- **Last modified timestamps** - Per-document git history
- **Environment variables** - Easy configuration via .env
- **Custom branding** - Override title, logo, tagline
- **Keyboard shortcuts** - Ctrl+K for search, ESC to close

---

## ✅ Completed (continued)

### Better Search (v0.4.0)
- **Fuzzy matching** - Typo tolerance and partial matching with fuzzysort
- **Relevance scoring** - Better ranked results
- **Content search** - Searches both titles and document content

### Navigation & Productivity (v0.5.0)
- **Edit Button** - One-click to fix docs on GitHub/GitLab
- **Keyboard Navigation** - j/k for next/prev, / for search, arrows in results
- **Enter to select** - Navigate search results without mouse

---

## 📋 Roadmap
*(All features sorted easiest → hardest)*

---

### 🟢 Easy (Quick Wins)

**Last Updated Timestamp**
- Show git commit date per doc
- Display author who last edited
- Already have git data, just display it

**Theme Auto-Detection**
- Respect system `prefers-color-scheme`
- CSS media query, no JS needed

**Health Endpoint**
- `/health` for monitoring tools
- Simple status route

---

### 🟡 Medium (Some Work)

**Print-Friendly CSS**
- Hide nav/sidebar when printing
- Optimize layout for paper
- Clean page breaks

**Anchor Links**
- Clickable headings with permalink
- Copy link button on hover
- Scroll to anchor on page load

**Auto-Refresh Notifications**
- Poll `/api/commit` for changes
- Toast when docs are outdated
- One-click refresh

**Code Block Enhancements**
- Line numbers (toggle-able)
- Diff rendering (```diff blocks)
- Highlight specific lines
- Copy individual lines

**Broken Link Checker**
- Scan docs for 404s
- Warn about orphaned pages
- Find TODO/FIXME in docs

**Sitemap Generation**
- Generate sitemap.xml for SEO
- Auto-update on doc changes

---

### 🟠 Medium-Hard (Bigger Features)

**Document History Viewer**
- Show git log per file
- See who changed what
- Diff between versions

**Version/Branch Switcher**
- Dropdown to switch branches (main, dev)
- View different version tags
- Fetch and cache multiple branches

**Metrics & Analytics**
- Track page views, popular docs
- Search analytics
- Privacy-friendly (no tracking)

---

### 🔴 Hard (Major Work)

**Versioned URLs**
- `/docs/v0.3.0/guide/` vs `/docs/latest/guide/`
- Routing architecture change
- Permanent version links

**PDF Export**
- Export single doc or whole site
- Requires PDF generation library
- Complex formatting

**Multi-Repository Support**
- Clone multiple git repos
- Namespace by repo
- Switch between doc sources
- Major architecture change

---

## Contributing

Have an idea? Open an issue or submit a PR!
