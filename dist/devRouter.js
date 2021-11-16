"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var esbuild_1 = require("esbuild");
var path_1 = require("path");
var events_1 = __importDefault(require("events"));
var express_1 = require("express");
var promises_1 = require("fs/promises");
var reloadScript = '';
(0, promises_1.readFile)((0, path_1.resolve)(__dirname, 'reloader.js')).then(function (buff) {
    reloadScript = '\n\n' + buff;
});
function devRouter(buildOptions) {
    var app = (0, express_1.Router)();
    var ev = new events_1.default();
    app.get('/reloader', function (req, res) {
        // console.log('SSE opened');
        res.set({
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive'
        });
        res.flushHeaders();
        var reload = function () {
            console.log('Reloading');
            res.write('event: reload\ndata: \n\n');
        };
        ev.on('reload', reload);
        res.on('close', function () {
            // console.log('SSE closed');
            ev.off('reload', reload);
        });
    });
    var files = {};
    var _a = buildOptions.outdir, outdir = _a === void 0 ? 'dist' : _a;
    var storeBuild = function (result) {
        for (var _i = 0, _a = result.outputFiles; _i < _a.length; _i++) {
            var file = _a[_i];
            var filename = (0, path_1.relative)(outdir, file.path);
            files[filename] = file.contents;
            console.log(filename);
        }
        ev.emit('reload');
    };
    (0, esbuild_1.build)(__assign(__assign({ bundle: true, color: true, logLevel: 'info', minify: false, sourcemap: 'inline', outdir: outdir, target: 'chrome80', loader: {
            '.png': 'file'
        } }, buildOptions), { write: false, watch: {
            onRebuild: function (error, result) {
                storeBuild(result);
            }
        } })).then(storeBuild);
    app.get('/:filename', function (req, res, next) {
        var filename = req.params.filename;
        var file = files[filename];
        var extension = (0, path_1.extname)(filename);
        if (file) {
            res.type(extension);
            res.write(file);
            if (extension === '.js')
                res.write(reloadScript);
            res.end();
        }
        else {
            next();
        }
    });
    return app;
}
exports.default = devRouter;
