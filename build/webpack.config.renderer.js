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
        title: "Ambiny",
    }),
    new webpack.LoaderOptionsPlugin({
        debug: isDev,
    }),
];

if (isDev) {
    plugins.push(new webpack.HotModuleReplacementPlugin());
}

const config = {
    context: path.resolve(__dirname, '..', 'src', 'renderer'),
    target: 'web',
    entry: './index.tsx',
    output: {
        filename: 'renderer.js',
        path: path.resolve(__dirname, '..', 'dist'),
        publicPath: isDev ? 'http://localhost:8080/' : '',
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
        hot: true,
        contentBase: path.resolve(__dirname, '..', 'dist'),
    };

    config.devtool = 'source-map';
}

module.exports = merge(base, config);
