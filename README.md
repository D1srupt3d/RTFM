# RTFM

Simple documentation server. Write docs in Markdown, auto-pulls from Git.

![RTFM Screenshot](screenshot.png)

## Setup

```bash
git clone https://github.com/d1srupt3d/rtfm.git
cd rtfm
cp env.template .env
# Edit .env with your docs repo
docker-compose up -d
```

## Config

Edit `.env`:
```bash
DOCS_REPO=https://github.com/user/docs.git
DOCS_BRANCH=main
PORT=3000
GITHUB_PAT=ghp_token  # for private repos
```

## Docs Structure

```
docs/
├── index.md
├── guides/
│   └── example.md
```

Restart container to pull updates:
```bash
docker-compose restart
```

## Development

```bash
npm install
npm run dev
```
