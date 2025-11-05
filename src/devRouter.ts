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

            //@ts-ignore Fix for compression, if installed
            res.flush?.();
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
        // Clear old files to prevent memory leak when filenames change
        for (const key in files) {
            delete files[key];
        }

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
        try {
            const ctx = await context({
                bundle: true,
                color: true,
                logLevel: 'info',
                minify: false,
                sourcemap: 'inline',
                outdir,
                target: 'es2022',
                loader: {
                    '.png': 'file',
                    ".jpg": "file",
                    ...(buildOptions.loader ?? {})
                },
                ...buildOptions,
                inject: [resolve(__dirname, 'reloader.js'), ...buildOptions.inject ?? []],
                write: false,
                plugins: [
                    ...(buildOptions.plugins ?? []),
                    {
                        name: 'onRebuild',
                        setup(build) {
                            build.onEnd(result => {
                                if (result.errors.length > 0) {
                                    console.error(`Build failed with ${result.errors.length} error(s):`);
                                    result.errors.forEach(error => {
                                        console.error(error);
                                    });
                                } else {
                                    console.log('Build succeeded');
                                }
                                storeBuild(result);
                            })
                        },
                    }
                ]
            })

            await ctx.watch()

        } catch (error) {
            console.error('Failed to initialize esbuild context:', error);
            throw error;
        }
    })();







    app.get('/:filename', (req, res, next) => {
        const { filename } = req.params;
        const file = files[filename];
        const extension = extname(filename);
        if (file) {
            res.type(extension);
            res.write(file);
            res.end();
        } else {
            next();
        }
    });

    return app;

}

// Exporting again for packages having trouble with default imports
export { devRouter, BuildOptions }   