const path = require('path');
const base = require('./webpack.config');
const { merge } = require('webpack-merge');

module.exports = merge(base, {
    context: path.resolve(__dirname, '..', 'src', 'main'),
    target: 'electron-preload',
    entry: './preload.js',
    output: {
        filename: 'preload.js',
        path: path.resolve(__dirname, '..', 'dist'),
        publicPath: '/'
    },
    externals: {
        worker_threads: 'commonjs',
    },
    node: {
        __dirname: false,
    },
    externals:  {
        serialport: 'commonjs2 serialport'
    }
});
