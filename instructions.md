## Registering provider

Like any other provider, you need to register the provider inside `start/app.js` file.

There are 5 separate providers: You'll have to add each of them to the _providers_ array depending on you needs

>NOTE: The **validation** provider should only be included when the `@adonisjs/validator` package is installed

```js
const providers = [
  'adonisjs-extensions/providers/RequestExtensionProvider',
  'adonisjs-extensions/providers/ResponseExtensionProvider',
  'adonisjs-extensions/providers/ViewExtensionProvider',
  'adonisjs-extensions/providers/RouteExtensionProvider',
  //'adonisjs-extensions/providers/ValidationExtensionProvider'
]
```

>Add Middleware to `start/kernel.js` file

```js
const globalMiddleware = [
  'Adonis/Middleware/Session',
  ...
  'Adonis/Middleware/UpdateViewData'
]
```

## Config

The configuration is saved inside `config/extension.js` file. Tweak it accordingly.

## Docs

To find out more, read the docs [here](https://github.com/stitchng/adonis-extensions).
