# esbuild-dev-router

Super fast developer router using esbuild and page reloading for any development server. Integrates seamlessly with Express to provide instant hot-reload capabilities during development.

## Features

- ⚡ Lightning-fast builds with esbuild
- 🔄 Automatic page reloading on file changes
- 📦 Built-in support for TypeScript
- 🖼️ Asset handling (PNG, JPG, and custom loaders)
- 🎯 Zero-config setup
- 🔌 Express middleware integration

## Installation

```shell
npm install -D esbuild-dev-router
```

## Requirements

- Node.js 18+
- esbuild >0.17
- Express 4.x or 5.x

## Usage

### Basic Setup

```javascript
import express from 'express';
import devRouter from 'esbuild-dev-router';
import { resolve } from 'path';

const app = express();
app.listen(5000);

app.use(devRouter({
    entryPoints: [resolve(__dirname, 'web/index.ts')]
}));

app.use(express.static(resolve(__dirname, 'public')));
```

### Configuration Options

Pass any valid esbuild `BuildOptions` to customize the build:

```javascript
app.use(devRouter({
    entryPoints: [resolve(__dirname, 'web/index.ts')],
    target: 'es2020',
    minify: false,
    sourcemap: 'inline',
    loader: {
        '.svg': 'file',
        // custom loaders...
    }
}));
```

## How It Works

1. **Watches for Changes**: Monitors your source files using esbuild's watch mode
2. **Rebuilds on Demand**: Automatically rebuilds when TypeScript/JavaScript files change
3. **Serves Built Assets**: Provides an Express middleware to serve compiled bundles
4. **Live Reload**: Injects a reloader script that communicates via Server-Sent Events (SSE)
5. **Page Reload**: Triggers automatic page reload when assets change

## API

### `devRouter(options)`

Returns an Express Router that handles:
- `GET /reloader` - SSE endpoint for reload notifications
- `GET /:filename` - Serves compiled assets (JS, CSS, etc.)

**Parameters:**
- `options` (BuildOptions): esbuild build configuration object

## Development

```bash
# Install dependencies
npm install

# Run test server
npm run test

# Build the project
npm run build
```

## License

Apache License 2.0

