const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: path.join(__dirname, "src/index.js"),
    devServer: {
        hot: true,
        port: 2033
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "bundle.js",
    },
    plugins: [
        new CopyPlugin({
            from: path.join(__dirname, "assets"),
            to: "."
        })
    ]
}