import { build, BuildOptions, BuildResult } from 'esbuild';
import { relative, extname, resolve } from 'path';
import EventEmitter from 'events';
import { Router } from 'express';
import { readFile } from 'fs/promises';

let reloadScript = '';

readFile(resolve(__dirname,'reloader.js')).then(buff => {
    reloadScript = '\n\n' + buff;
});



export default function devRouter(buildOptions: BuildOptions) {

    const app = Router();

    const ev = new EventEmitter();



    app.get('/reloader', (req, res) => {
        // console.log('SSE opened');
        res.set({
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive'
        });
        res.flushHeaders();

        const reload = () => {
            console.log('Reloading');
            res.write('event: reload\ndata: \n\n');
        }

        ev.on('reload', reload);


        res.on('close', () => {
            // console.log('SSE closed');
            ev.off('reload', reload);
        })
    });



    const files: { [key: string]: Uint8Array } = {};

    const { outdir = 'dist' } = buildOptions

    const storeBuild = (result: BuildResult) => {
        for (let file of result.outputFiles) {
            const filename = relative(outdir, file.path);
            files[filename] = file.contents;
            console.log(filename);
        }
        ev.emit('reload');
    }



    build({
        bundle: true,
        color: true,
        logLevel: 'info',
        minify: false,
        sourcemap: 'inline',
        outdir,
        target: 'chrome80',
        loader: {
            '.png': 'file'
        },
        ...buildOptions,
        write: false,
        watch: {
            onRebuild: (error, result) => {
                storeBuild(result);
            }
        },

    }).then(storeBuild);



    app.get('/:filename', (req, res, next) => {
        const { filename } = req.params;
        const file = files[filename];
        const extension = extname(filename);
        if (file) {
            res.type(extension);
            res.write(file);
            if (extension === '.js')
                res.write(reloadScript);
            res.end();

        } else {
            next();
        }
    });

    return app;

}