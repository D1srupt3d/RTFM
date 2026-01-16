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

## 🚧 In Progress

### Better Search
Current: Basic full-text search
Planned enhancements:
- Fuzzy matching (typo tolerance)
- Search result snippets with highlighting
- Search within code blocks

---

## 📋 Planned

### Document Templates
Pre-formatted docs for common scenarios:
- Server setup template
- Troubleshooting template
- Configuration template
- Via frontmatter or special syntax

---

## 💭 Future Ideas

### Auto-Refresh on Updates
Notify users when docs are updated:
- Poll `/api/commit` endpoint
- Toast notification on changes
- "Refresh to see latest" button

### Enhanced Navigation
- "Related Docs" based on internal links
- Recently viewed pages
- Page history sidebar

### Theme Enhancements
- Auto theme detection based on system preference (`prefers-color-scheme`)
- Custom theme builder UI (color picker for creating themes)
- Per-document theme overrides via frontmatter

### Export & Sharing
- Export docs to PDF
- Generate static HTML site
- Share individual docs via shareable links
- Markdown export with all assets

### Collaboration Features
- Comments/annotations on docs (stored in git)
- Suggested edits workflow
- Change tracking and history viewer
- Multi-user edit notifications

### Advanced Search
- Search filters (by date, author, tags)
- Search within specific folders
- Regex search support
- Search history and saved searches

### Content Features
- Code execution/playgrounds (sandboxed)
- Interactive examples and demos
- Embedded video/audio support
- LaTeX/Math equation rendering
- Collapsible sections
- Tabs and accordion components

### Integration & API
- Webhook support for external updates
- REST API for programmatic access
- Slack/Discord notifications
- CI/CD integration for doc validation
- OpenAPI/Swagger integration

### Performance & Scale
- Document caching layer
- Lazy loading for large docs
- CDN support for assets
- Full-text search with Elasticsearch
- Multi-repository support

---

## Contributing

Have an idea? Open an issue or submit a PR!
