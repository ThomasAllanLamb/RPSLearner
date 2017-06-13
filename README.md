# Setup for development

```shell
git install
webpack
npm start
```

Visit http://localhost:3000.


# Setup for production

```shell
git install
webpack -p
npm start
```


# TODO

- Several functions e.g. arrayMap.get, arrayMap.set solve something by using helper methods. But instead of having separate methods, they overload the original method. This seems messy. Convert to two separate methods: one public, one private helper.
- Webpack title
- When updating statistics, don't use .innerHTML. Use method intended for text.
- Create production version of webpack
- Modernize markup and style
- Modernize class syntax. Maybe es6?
- Migrate about page