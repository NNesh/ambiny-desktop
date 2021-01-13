const webpack = require('webpack');
const path = require('path');
const base = require('./webpack.config');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

const plugins = [
    new HtmlWebpackPlugin({
        template: path.resolve(__dirname, '..', 'src', 'renderer', 'index.html'),
        title: "Ambinight",
    }),
    new webpack.LoaderOptionsPlugin({
        debug: isDev,
    }),
];

if (isDev) {
    plugins.push(new webpack.HotModuleReplacementPlugin());
}

const config = {
    target: 'electron-renderer',
    entry: './src/renderer/index.tsx',
    output: {
        filename: 'renderer.js',
        path: path.resolve(__dirname, '..', 'dist'),
        publicPath: isDev ? 'http://localhost:8080/' : 'ambinight:///',
    },
    externals: {
        'react/addons': true,
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true
    },
    plugins,
};

if (isDev) {
    config.devServer = {
        port: 8080,
        inline: true,
        hot: true
    };

    config.devtool = 'eval-source-map';
}

module.exports = merge(base, config);
