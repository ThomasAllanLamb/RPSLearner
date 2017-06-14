# Setup for development

```shell
npm install
webpack --watch
nodemon start
```

Visit http://localhost:3000.


# Setup for production on port 80


```shell
npm install
webpack -p
sudo PORT=80 node ./bin/www
```


# TODO

- When updating statistics, don't use .innerHTML. Use method intended for text.
- Create production version
- Modernize markup and style
- Modernize class syntax. Maybe es6?
- Move recall click event from tag to js
- Rename inputs from the variable they represent to something which distinguishes them from the variable.
- .dOMRoot way of exposing the DOM is kind of sketchy. Also makes it hard to write CSS for root elements. And CSS might affect unintended elements elsewhere in the document. Look into alternatives. Maybe iframe? DocumentFragment? maybe change index markup to include a root element?