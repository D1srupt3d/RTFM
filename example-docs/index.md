# Welcome to RTFM

**Read The F\*\*\*ing Manual** - A self-hosted documentation server.

## Getting Started

This is an example documentation site. To use RTFM with your own docs:

1. Create a Git repository with markdown files
2. Set `DOCS_REPO` in your `.env` file
3. Restart the container to pull your docs

## Features

- **14 Beautiful Themes** - Switch between Dark, Light, Catppuccin, Nord, Dracula, and more
- **Advanced Syntax Highlighting** - Support for 15+ programming languages
- **Full-text Search** - Press `Ctrl+K` to search across all documentation
- **Git-backed** - Your docs live in version control
- **Zero Configuration** - Just point and serve

## Example Pages

Check out these example pages to see what RTFM can do:

- [Syntax Test](syntax-test) - Showcase of syntax highlighting across 15+ languages

## Documentation Structure

Organize your docs however you like. RTFM automatically builds navigation from your folder structure:

```
docs/
├── index.md
├── getting-started/
│   ├── installation.md
│   └── configuration.md
├── guides/
│   ├── docker-setup.md
│   └── troubleshooting.md
└── reference/
    └── api.md
```

## Markdown Tips

RTFM supports GitHub Flavored Markdown (GFM):

### Code Blocks

Use triple backticks with language identifiers for syntax highlighting:

```javascript
console.log('Hello, RTFM!');
```

### Tables

| Feature | Supported |
|---------|-----------|
| Tables | ✅ |
| Code blocks | ✅ |
| Syntax highlighting | ✅ |
| Search | ✅ |

### Lists

- Unordered lists
- Work great
  - With nesting
  - Too

1. Ordered lists
2. Also work
3. Perfectly

### Blockquotes

> RTFM is designed for anyone who needs quick access to their documentation, whether it's infrastructure notes, API references, project guides, or "how did I fix this last time?" notes.

### Links

Internal links work automatically: `[Link text](other-page)`

External links: `[GitHub](https://github.com)`

---

**Ready to get started?** Check out the [GitHub repository](https://github.com/D1srupt3d/rtfm) for setup instructions.
