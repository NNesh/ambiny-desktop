const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const config = {
    mode: env,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "esbuild-loader",
                    options: {
                        loader: "tsx", // Remove this if you're not using JSX
                        target: "es2015", // Syntax to compile to (see options below for possible values)
                    },
                },
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "esbuild-loader",
                    options: {
                        loader: "jsx", // Remove this if you're not using JSX
                        target: "es2015", // Syntax to compile to (see options below for possible values)
                    },
                },
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.less/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'less-loader',
                ]
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(env),
        }),
        new MiniCssExtractPlugin(),
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        alias: {
            '@shared': path.resolve(__dirname, '..', 'src', 'shared'),
        },
    },
};

module.exports = config;
