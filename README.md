# esbuild-dev-router

super fast developer router using esbuild and page reloading for any development server

## Installation

```shell
npm install -D esbuild-dev-router
```
## Usage

```javascript
import express from 'express';
import devRouter from 'esbuild-dev-router';

const app = express();
app.listen(5000);

app.use(devRouter({
    entryPoints: [`${__dirname}/web/index.ts`]
}));

app.use(express.static(`${__dirname}/public`));
```

