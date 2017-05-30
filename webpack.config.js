const path = require("path");

module.exports = {
    output: {
        path: path.resolve(__dirname, "public"),
        filename: "index.html"
    },
    entry: path.resolve(__dirname, "client/index.pug"),
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
            {
                test: /\.pug$/,
                use: [
                    { loader: "html-loader" },
                    {   loader: "apply-loader",
                        options: {
                            args: [{}]
                    }   },
                    { loader: "pug-loader" }
                ]
            },
            {
                test: /\.js$/,
                use: [
                    { loader: "js-loader" }
                ]
            }
        ]
    },
    devtool: "cheap-eval-source-map"
};