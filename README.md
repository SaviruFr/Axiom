# ✨ Axiom

A URL security analysis tool integrating Google Safe Browsing API and machine learning for comprehensive threat detection.

## Technology Stack

- **Frontend**: TypeScript, Astro, TailwindCSS
- **APIs**: Google Safe Browsing, Gemini
- **Deployment**: Cloudflare Pages
- **Analysis**: Machine Learning

## System Requirements

- Node.js (18.x+)
- npm or pnpm

## API Keys Required

- Google Cloud Platform
  - Safe Browsing API
  - Gemini API
- Cloudflare Account

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Development
npm run dev

# Production
npm run build
npm run preview
```

## API Integration

```typescript
GOOGLE_SAFE_BROWSING_KEY=your_key
GEMINI_API_KEY=your_key
```

## Development Guidelines

- Use TypeScript strict mode
- Implement proper error handling

## Security Features

- Real-time URL analysis
- Phishing site identification
- Malware detection

## Production Deployment

```bash
npm run build
```

## Support

- Issues: GitHub Issue Tracker
- Security: savirufr@proton.me

## License

WTFPL

## Contact

[@SaviruFr](https://github.com/SaviruFr) - savirufr@proton.me
