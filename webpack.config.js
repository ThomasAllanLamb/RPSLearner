const path = require("path");

module.exports = {
    entry: path.resolve(__dirname, "client/app.js",
    output: {
        path: path.resolve(__dirname, "public"),
        filename: "bundle.js"
    },
    module: {
        rules: [
            { 
                test: /\.less$/,
                use: [
                    {loader: "style-loader"}
                    , {loader: "css-loader"}
                    , {loader: "less-loader"}
                ]
            }
            ,{
                test: /\.pug$/,
                use: [
                    {loader: "pug-loader"}
                ]
            }
        ]
    }
};