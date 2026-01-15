# Changelog

All notable changes to this project will be documented in this file.

## [0.2.1] - 2026-01-15

### Fixed
- Fixed marked initialization timing issue that prevented documents from loading
- Ensured marked ES module is fully initialized before server accepts requests

## [0.2.0] - 2026-01-15

### Added
- **Enhanced Syntax Highlighting**: Added support for 15+ programming languages
  - JavaScript, TypeScript, Python
  - Bash/Shell, YAML, JSON
  - Dockerfile, Nginx, SQL
  - Go, Rust, XML, CSS
- **Language Badges**: Code blocks now display language badges in the top-left corner
- **Improved Language Detection**: Custom marked renderer preserves language classes for proper highlighting
- **Example Documentation**: Added `example-docs/` folder with sample content
  - Welcome page template
  - Comprehensive syntax highlighting test page (15+ languages)
  - Serves as both template and feature showcase

### Changed
- Updated highlight.js to load language-specific modules for better syntax detection
- Modified marked configuration to use custom renderer for code blocks
- Bumped version to 0.2.0

### Technical
- Implemented dynamic ES module import for marked (v17+) while maintaining CommonJS compatibility
- Added language-specific highlight.js libraries via CDN
- Enhanced `highlightCode()` function to automatically add language badges

## [0.1.0] - Initial Release

### Added
- Git-backed documentation serving
- 14 theme variants (Dark, Light, Catppuccin, Nord, Dracula, etc.)
- Full-text search with Ctrl+K shortcut
- Basic syntax highlighting
- Auto-generated navigation from folder structure
- Mobile responsive design
- Private repository support with GitHub PAT
- Markdown rendering with gray-matter frontmatter
