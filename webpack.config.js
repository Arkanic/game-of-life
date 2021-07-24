const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
    entry: "./src/js/bootstrap.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bootstrap.js",
    },
    mode: "production",
    experiments: {
        asyncWebAssembly: true
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "./src/static/",
                    to: "."
                }
            ]
        })
    ],
};