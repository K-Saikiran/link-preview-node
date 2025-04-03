# link-preview-node 🔗

A powerful and flexible Node.js library for generating rich link previews with support for OpenGraph, Twitter Cards, and custom HTML parsing. Features built-in caching support with both in-memory and Redis options.

## ✨ Features

- 🚀 Fast and lightweight
- 🎯 Support for OpenGraph and Twitter Card metadata
- 📦 Built-in caching (memory and Redis)
- 🔄 Fallback parsing for non-metadata sites
- 💪 TypeScript support
- ⚡ Promise-based API
- 🛡️ URL validation and sanitization

## 📦 Installation

```bash
npm install link-preview-node

# If you want to use Redis caching
npm install link-preview-node ioredis
```

## 🚀 Quick Start

```typescript
import LinkPreview from 'link-preview-node';

// Basic usage
const linkPreview = new LinkPreview()
const preview = await linkPreview.getLinkPreview('https://github.com');

// With options
const linkPreview = new LinkPreview({
  requestTimeout: 5000,
});
const previewWithOptions = await getLinkPreview('https://github.com');
```

Example output:
```javascript
{
  url: 'https://github.com',
  title: 'GitHub: Where the world builds software',
  desc: 'GitHub is where over 100 million developers shape the future of software...',
  image: 'https://github.githubassets.com/images/modules/site/social-cards/homepage.png',
  siteName: 'GitHub'
}
```

## ⚙️ Configuration Options

```typescript
interface LinkPreviewOptions {
  requestTimeout?: number;        // Request timeout in ms (default: 10000)
  cacheMaxAge?: number;    // Cache duration in seconds (No-Cache if this is null or undefined)
  redis?: Redis;          // Redis instance for caching (optional)
  headers?: Record<string, string>; // Custom request headers
  maxRedirects?: number; // Max redirects allowed for the request (default: 5)
}
```

## 🔄 Caching

### In-Memory Cache
By default, link-preview-node uses in-memory caching:

```typescript
const linkPreview = new LinkPreview({
  cacheMaxAge: 3600 // 1 hour
})

const preview = await linkPreview.getLinkPreview('https://github.com');
```

### Redis Cache
For distributed systems, you can use Redis caching:

```typescript
import Redis from 'ioredis';
import { getLinkPreview } from 'link-preview-node';

const redis = new Redis({
  host: 'localhost',
  port: 6379
});

const linkPreview = new LinkPreview({
  cacheMaxAge: 3600 // 1 hour
  redis
})

const preview = await getLinkPreview();
```

## 🎯 Advanced Usage

### Custom Headers

```typescript
const linkPreview = new LinkPreview({
  headers: {
    'User-Agent': 'Custom User Agent',
    'Accept-Language': 'en-US'
  }
})

const preview = await linkPreview.getLinkPreview('https://github.com');
```

## 📝 TypeScript Support

The package includes TypeScript definitions out of the box:

```typescript
import { getLinkPreview, LinkPreview, LinkPreviewOptions } from 'link-preview-node';

const options: LinkPreviewOptions = {
  timeout: 5000,
};

const linkPreview = new LinkPreview(options);

const preview: LinkPreview = await linkPreview.getLinkPreview('https://github.com');
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/K-Saikiran/link-preview-node/issues).

Made with ❤️ by [saikiran_k12](https://github.com/K-Saikiran)