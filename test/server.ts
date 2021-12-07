import express from 'express';
import devRouter from '../src/devRouter';
import { resolve } from 'path';

const {
    PORT = '5000'
} = process.env

const app = express();
app.listen(+PORT, function (this: any) {
    const { address, port } = this.address();
    console.log(`Server listening ${address}:${port}`);
});


app.use(devRouter({
    entryPoints: [resolve(__dirname, 'web/index.ts')]
}));


app.use(express.static(resolve(__dirname, 'public')));






