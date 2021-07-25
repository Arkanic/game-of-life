const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const path = require('path');

module.exports = {
    entry: "./src/js/bootstrap.js",
    mode: "production",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[contenthash].js",
    },
    stats: {
        children: true
    },
    experiments: {
        asyncWebAssembly: true
    },
    optimization: {
        splitChunks: {
            chunks: "all"
        },
        moduleIds: "deterministic",
        minimizer: [
            new TerserJSPlugin({})
        ]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: "/node_modules/",
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-env"
                        ]
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    "css-loader"
                ]
            }
        ]
    },
    plugins: [
        /*new CopyWebpackPlugin({
            patterns: [
                {
                    from: "./src/static/",
                    to: "."
                }
            ]
        }),*/
        new MiniCssExtractPlugin({
            filename: "[contenthash].css"
        }),
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: "src/templates/index.html",
            inject: "body"
        }),
        new CleanWebpackPlugin({})
    ],
};