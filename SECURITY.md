# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :green_check_mark: |

## Reporting a Vulnerability

**Do not open public issues for security vulnerabilities.**

Instead, open a private security advisory on GitHub or contact the me directly.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Time

- Initial response: Within 48 hours
- Status update: Within 7 days
- Fix timeline: Varies by severity

## Security Best Practices

When deploying RTFM:

1. **Private Repositories**: Use GitHub Personal Access Tokens with minimal scopes (read-only if possible)
2. **Environment Variables**: Never commit `.env` files or tokens to git
3. **Network Security**: Deploy behind reverse proxy with TLS/SSL
4. **Access Control**: Restrict network access to documentation server as needed
5. **Updates**: Keep dependencies updated regularly

## Known Security Considerations

- PATs in environment variables are visible to container processes
- Public docs repos don't require authentication
- No built-in user authentication (add via reverse proxy if needed)
