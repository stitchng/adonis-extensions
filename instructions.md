## Registering provider

Like any other provider, you need to register the provider inside `start/app.js` file.

There are 3 separate providers: You'll have to add each of them to the _providers_ array depending on you needs

>NOTE: The **validation** provider should only be included when the `@adonisjs/validator` package is installed

```js
const providers = [
  '@stitchng/adonis-extensions/providers/RequestExtensionProvider',
  '@stitchng/adonis-extensions/providers/ResponseExtensionProvider',
  '@stitchng/adonis-extensions/providers/ViewExtensionProvider',
  '@stitchng/adonis-extensions/providers/ValidationExtensionProvider'
]
```

## Config

The configuration is saved inside `config/extension.js` file. Tweak it accordingly.

## Docs

To find out more, read the docs [here](https://github.com/stitchng/adonis-extensions).
