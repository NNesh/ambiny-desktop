const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const config = {
    mode: env,
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-react',
                            ['@babel/preset-env', {
                                'useBuiltIns': 'entry',
                            }],
                        ],
                        plugins: [
                            '@babel/plugin-syntax-dynamic-import',
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-proposal-export-default-from',
                        ],
                    },
                },
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-react',
                                ['@babel/preset-env', {
                                    'useBuiltIns': 'entry',
                                }],
                            ],
                            plugins: [
                                '@babel/plugin-syntax-dynamic-import',
                                '@babel/plugin-proposal-class-properties',
                                '@babel/plugin-proposal-export-default-from',
                            ],
                        },
                    },
                    {
                        loader: 'ts-loader',
                    }
                ],
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
