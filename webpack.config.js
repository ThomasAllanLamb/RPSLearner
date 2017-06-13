const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: path.resolve(__dirname, "client/app.js"),
    
    output: {
        path: path.resolve(__dirname, "public"),
        filename: "index_bundle.js"
    },
    
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    { loader: "css-loader" },
                    { loader: "less-loader" }
                ]
            },

            //evaluate .pug into static html using no local vars
            /*{
                test: /\.pug$/,
                use: [
                    { loader: "raw-loader" }
                    { loader: "html-loader"},
                    {   loader: "apply-loader",
                        options: {
                            args: []
                    }   },
                    { loader: "pug-loader" }
                ]
            },*/

            {
                test: /\.html$/,
                use: [
                    { loader: "raw-loader"}
                ]
            }
        ]
    },

    plugins: [new HTMLWebpackPlugin({
        title: "RPS Learner"
    })],

    devtool: "cheap-source-map"
};