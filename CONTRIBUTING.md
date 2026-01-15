# Contributing

Thanks for your interest in contributing to RTFM!

## How to Contribute

1. Fork the repo
2. Create a feature branch (\git checkout -b feature/thing\)
3. Make your changes
4. Test locally with pm run dev5. Commit your changes (\git commit -am 'Add thing'\)
6. Push to the branch (\git push origin feature/thing\)
7. Open a Pull Request

## Development Setup

\\ash
git clone https://github.com/D1srupt3d/rtfm.git
cd rtfm
npm install
cp env.template .env
# Edit .env with your test docs repo
npm run dev
\
## Guidelines

- Keep code clean and simple
- Test your changes before submitting
- Update README if adding features
- Follow existing code style

## Reporting Bugs

Open an issue with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc)

## Feature Requests

Open an issue describing:
- The feature you'd like
- Why it would be useful
- How it might work
