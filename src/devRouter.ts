import { context, BuildOptions, BuildResult } from 'esbuild';
import { relative, extname, resolve } from 'path';
import { EventEmitter } from 'events';
import { Router } from 'express';


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
            // console.log('Reloading');
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
        let totalAssets = 0;
        for (let file of result.outputFiles) {
            const filename = relative(outdir, file.path);
            files[filename] = file.contents;
            if (filename.endsWith('.js') || filename.endsWith('.css'))
                console.log(filename);
            else
                totalAssets++;
        }
        if (totalAssets)
            console.log('Assets: ', totalAssets)

        ev.emit('reload');
    }


    (async () => {
        const ctx = await context({
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
            inject: [resolve(__dirname, 'reloader.js'), ...buildOptions.inject ?? []],
            write: false,
            plugins: [
                {
                    name: 'onRebuild',
                    setup(build) {
                        build.onEnd(result => {
                            console.log(`build ended with ${result.errors.length} errors`);
                            storeBuild(result);
                        })
                    },
                }
            ]
        })

        ctx.watch()


    })();







    app.get('/:filename', (req, res, next) => {
        const { filename } = req.params;
        const file = files[filename];
        const extension = extname(filename);
        if (file) {
            res.type(extension);
            res.write(file);
            // if (extension === '.js')
            //     res.write(reloadScript);
            res.end();

        } else {
            next();
        }
    });

    return app;

}

// again for packages having trouble with default imports
export { devRouter }   