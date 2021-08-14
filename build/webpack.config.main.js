const path = require('path');
const base = require('./webpack.config');
const { merge } = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(base, {
    target: 'electron-main',
    entry: './src/main/main.js',
    context: path.resolve(__dirname, '..'),
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, '..', 'dist'),
        publicPath: '/'
    },
    externals: {
        worker_threads: 'commonjs',
    },
    node: {
        __dirname: false,
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: 'assets/images',
                    to: 'images',
                }
            ],
        }),
    ],
});
