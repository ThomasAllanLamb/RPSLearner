# Setup for development

```shell
npm install
webpack --watch
```

New terminal window:
```shell
nodemon start
```

Visit http://localhost:3000.


# Setup for production on port 80


```shell
npm install
npm run build
sudo PORT=80 node ./bin/www
```


# TODO

- When updating statistics, don't use .innerHTML. Use method intended for text.
- Modernize About page markup and style
- Modernize class syntax. Maybe es6?
- The .dOMRoot way of exposing the DOM is kind of sketchy. Also makes it hard to write CSS for root elements. And CSS might affect unintended elements elsewhere in the document. Look into alternatives. Maybe iframe? DocumentFragment? maybe change index markup to include a root element?
- How should About page be handled? Currently handled as an independent entry point which is emitted with file-loader. Is there a way to emit it without using file-loader? Emitting this way seems kind of hacky because file-loader is intended for creating links, which is slightly different.
- How to deploy? I'm guessing prod should get bundles instead of sources
- Recall limit currently maps 1 onto "remember nothing" and 0 locks. 0 should be "remember nothing"
- there is a resolution which chops off boring section.
- Responsive:
  - Chromium works
  - Mobile Chrome does not