# RTFM - Read The F***ing Manual

A dead-simple documentation server for your homelab. Write docs in Markdown, push to GitHub, auto-pulls on startup.

## Features

- 📝 **Pure Markdown** - No special syntax or templating
- 🔄 **Git Integration** - Auto-pulls from repository on startup
- 🔍 **Fast Search** - Full-text search across all docs
- 🎨 **Beautiful UI** - Modern purple dark theme
- 🐳 **Docker Ready** - One command deployment
- 📱 **Mobile Friendly** - Works on all devices
- ⌨️ **Keyboard Shortcuts** - Ctrl+K for search, ESC to close

## Quick Start

```bash
# Clone RTFM
git clone https://github.com/d1srupt3d/rtfm.git
cd rtfm

# Create .env file from template
cp env.template .env

# Edit .env - set your docs repository URL and webhook secret
nano .env

# Start
docker-compose up -d
```

Visit `http://localhost:3000`

## Configuration

### Required (.env)

```bash
# Your documentation repository
DOCS_REPO=https://github.com/yourusername/my-docs.git
```

### Optional (.env)

```bash
# Repository branch
DOCS_BRANCH=main

# Server port
PORT=3000

# GitHub PAT for private repos (leave empty for public)
GITHUB_PAT=ghp_yourtoken

# Site branding
SITE_TITLE=RTFM
SITE_TAGLINE=Documentation
SITE_LOGO=📚
GITHUB_LINK=https://github.com/yourusername/repo
```

### Advanced Branding (config.js)

For custom footer links, copy `config.js` locally and edit:

```javascript
module.exports = {
  site: {
    title: 'My Docs',
    tagline: 'Documentation',
    logo: '🏠'
  },
  links: {
    github: 'https://github.com/username/repo',
    custom: [
      { title: 'Grafana', url: 'https://grafana.local', external: true }
    ]
  }
};
```

Then uncomment in `docker-compose.yml`:
```yaml
- ./config.js:/app/config.js:ro
```

**Note:** Environment variables override config.js

## Documentation Structure

RTFM recursively finds all `.md` files in your repository:

```
my-docs/
├── index.md                 # Home page
├── getting-started/
│   ├── quickstart.md
│   └── installation.md
└── guides/
    └── docker.md
```

- **Folders** become navigation sections
- **Files** are sorted alphabetically
- Use lowercase with hyphens: `my-guide.md`

### Frontmatter (Optional)

Override auto-generated titles:

```markdown
---
title: My Custom Title
---

# Content here
```

## Updating Documentation

RTFM automatically clones/pulls your docs repository on startup.

To update docs after pushing changes to your repository:

```bash
# Restart the container to pull latest changes
docker-compose restart

# Or if running locally
npm start
```

The server will automatically pull the latest changes from your `DOCS_REPO` on startup.

## Deployment

### Using Pre-Built Image

```yaml
services:
  rtfm:
    image: ghcr.io/d1srupt3d/rtfm:latest
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - docs-data:/app/docs
    restart: unless-stopped

volumes:
  docs-data:
```

### With Reverse Proxy

**Caddy:**
```caddyfile
docs.yourdomain.com {
    reverse_proxy rtfm:3000
}
```

**Nginx:**
```nginx
location / {
    proxy_pass http://rtfm:3000;
    proxy_set_header Host $host;
}
```

## Development

```bash
npm install
npm run dev
```

## Troubleshooting

### Docs Not Loading

```bash
docker-compose logs -f rtfm
```

Check:
- `DOCS_REPO` is correct
- Repository is accessible (public or PAT set)
- Logs for clone/pull errors

### Permission Denied

For private repos:
- Verify `GITHUB_PAT` is set in `.env`
- PAT needs `repo` scope
- Check token hasn't expired

## License

MIT

---

**RTFM** - Because sometimes you actually want to read the manual.
