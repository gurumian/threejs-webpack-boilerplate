const path = require('path');
const webpack = require('webpack');
const copyFiles = require('copy-webpack-plugin');

module.exports = {
    entry: './src/client.ts',
    target: ["web"],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [{
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    }
                ]
            },
            {
                test: /\.(ttf|eot|svg|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [{
                    loader: 'file-loader'
                }]
            },
            {
                test: /.(sass|scss)$/,
                use: [
                { loader: 'style-loader' },
                { loader: 'css-loader' },
                { loader: 'sass-loader' },
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [{
                    loader: 'file-loader'
                }]
            },
        ],
    },
    plugins: [
        // fix "process is not defined" error:
        // (do "npm install process" before running the build)
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new copyFiles({
            patterns: [
                { from: './public/css', to: 'css' },
                { from: './public/fonts', to: 'fonts' },
                { from: './public/index.html', to: 'index.html' }
            ]
        })
    ],
    resolve: {
        alias: {
            three: path.resolve('./node_modules/three')
        },
        extensions: ['.tsx', '.ts', '.js'],
        // fallback: {
        //     "stream": false,
        //     "crypto": false,
        //     "dgram": false,
        // },
        // extensions: [ '.ts', '.js' ],
        fallback: {
            // "stream": require.resolve("stream-browserify"),
            // "buffer": require.resolve("buffer"),
            // "zlib": require.resolve("browserify-zlib"),
            // "https": require.resolve("https-browserify"),
            // "http": require.resolve("stream-http")
        }
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'),
    }
};
