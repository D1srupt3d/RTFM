# RTFM - Read The F*** Manual

A dead-simple documentation server for your homelab. Write docs in Markdown, push to GitHub, auto-update with webhooks. That's it.

## Why RTFM?

Because you hate mkdocs/bookstack/and others. This is just:
- **Node.js + Express + Markdown**
- No build steps, no complexity
- Beautiful purple dark theme
- Auto-updates from GitHub

## Features

- ✅ **Pure Markdown** - No special syntax or templating
- ✅ **Auto-Updates** - GitHub webhooks pull latest changes automatically
- ✅ **Fast Search** - Full-text search across all docs
- ✅ **Beautiful UI** - Modern purple dark theme with smooth animations
- ✅ **Simple Config** - Just set your title/logo, we handle the rest
- ✅ **Docker Ready** - One command deployment
- ✅ **Separate Repos** - Keep docs in their own repository
- ✅ **Mobile Friendly** - Works perfectly on phones and tablets
- ✅ **Keyboard Shortcuts** - Ctrl+K for search, ESC to close

## Quick Start

### 1. Create Your Docs Repo

Create a separate GitHub repository for your documentation:

```bash
mkdir my-docs
cd my-docs
git init
echo "# Welcome to My Docs" > index.md
git add .
git commit -m "Initial docs"
git remote add origin https://github.com/yourusername/my-docs.git
git push -u origin main
```

### 2. Run RTFM with Docker

```bash
# Clone RTFM
git clone https://github.com/d1srupt3d/rtfm.git
cd rtfm

# Set your docs repo
export DOCS_REPO=https://github.com/yourusername/my-docs.git
export WEBHOOK_SECRET=$(openssl rand -hex 32)

# Start
docker-compose up -d
```

Visit `http://localhost:3000` 🎉

### 3. Set Up Auto-Updates (Optional)

Configure a GitHub webhook in your **docs repository**:

- **Payload URL:** `https://your-domain.com/webhook/github`
- **Content type:** `application/json`
- **Secret:** Use the same value as `WEBHOOK_SECRET` in your `.env`
- **Events:** Just the push event

Now every time you push to your docs repo, RTFM auto-updates!

## Configuration

### Environment Variables

Required:
```bash
DOCS_REPO=https://github.com/yourusername/my-docs.git
WEBHOOK_SECRET=$(openssl rand -hex 32)
```

Optional:
```bash
DOCS_BRANCH=main  # default
PORT=3000         # default
```

### Customize Branding (Optional)

```bash
cp config.example.json config.json
vim config.json
```

Then mount it in `docker-compose.yml`:
```yaml
volumes:
  - ./config.json:/app/config.json:ro
```

### Customize Colors

Edit `public/style.css` and change the CSS variables:
```css
:root {
    --color-primary: #a78bfa;      /* Your accent color */
    --color-bg-primary: #0a0a0f;   /* Background */
}

## Documentation Structure

Your docs repo can have any structure:

```
my-docs/
├── index.md                 # Home page
├── getting-started/
│   ├── quickstart.md
│   └── installation.md
├── guides/
│   ├── docker.md
│   └── networking.md
└── api/
    └── reference.md
```

- Folders become navigation sections
- Files are sorted alphabetically
- Use lowercase with hyphens: `my-guide.md`

### Frontmatter (Optional)

Add custom titles with frontmatter:

```markdown
---
title: My Custom Title
---

# My Custom Title

Content here...
```

## Development

```bash
# Install dependencies
npm install

# Set environment variables
export DOCS_REPO=https://github.com/yourusername/my-docs.git
export WEBHOOK_SECRET=dev-secret

# Run dev server with auto-restart
npm run dev
```

## Deployment

### Docker Compose (Recommended)

```yaml
version: '3.8'

services:
  rtfm:
    image: ghcr.io/yourusername/rtfm:latest
    ports:
      - "3000:3000"
    environment:
      - DOCS_REPO=https://github.com/yourusername/my-docs.git
      - WEBHOOK_SECRET=your-secret
    volumes:
      - docs-data:/app/docs
      # Optional: mount custom config for branding
      - ./config.json:/app/config.json:ro
    restart: unless-stopped

volumes:
  docs-data:
```

### With Reverse Proxy (Caddy)

```caddyfile
docs.yourdomain.com {
    reverse_proxy rtfm:3000
}
```

### With SSH Keys (Private Repos)

Mount your SSH key for private repositories:

```yaml
volumes:
  - docs-data:/app/docs
  - ~/.ssh/id_rsa:/root/.ssh/id_rsa:ro
```

Then use SSH URL:
```bash
DOCS_REPO=git@github.com:yourusername/my-private-docs.git
```

## Security

### Generate Webhook Secret

```bash
openssl rand -hex 32
```

Use this for both:
1. `WEBHOOK_SECRET` environment variable
2. GitHub webhook secret field

### HTTPS

Always use HTTPS in production. Use Caddy (automatic HTTPS) or nginx with Let's Encrypt.

### Private Docs

For private documentation repositories:
- Use SSH keys (mounted in Docker)
- Or use GitHub personal access tokens in HTTPS URLs
- Consider adding HTTP basic auth to RTFM itself

## Troubleshooting

### Docs Not Loading

Check logs:
```bash
docker-compose logs -f rtfm
```

Verify `DOCS_REPO` is correct and accessible.

### Webhook Not Working

1. Check GitHub webhook deliveries page
2. Verify `WEBHOOK_SECRET` matches in both places
3. Ensure RTFM is accessible from the internet
4. Check firewall/reverse proxy configuration

### Permission Denied (Git)

For private repos with SSH:
```bash
# Test SSH access
docker-compose exec rtfm ssh -T git@github.com
```

## License

MIT - Do whatever you want with it

## Contributing

PRs welcome! Keep it simple though - that's the whole point.


---

**RTFM** - Because sometimes you actually want to read the manual.