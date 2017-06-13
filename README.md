# Setup for development

```shell
npm install
webpack
npm start
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