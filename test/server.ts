import express from 'express';
import devRouter from '../src/devRouter';

const {
    PORT = '5000'
} = process.env

const app = express();
app.listen(+PORT, function (this: any) {
    const { address, port } = this.address();
    console.log(`Server listening ${address}:${port}`);
});

// console.log(__dirname);
// process.exit(0);

app.use(devRouter({
    entryPoints: [`${__dirname}/web/index.ts`]
}));


app.use(express.static(`${__dirname}/public`));






