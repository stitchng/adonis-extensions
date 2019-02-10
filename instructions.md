## Registering provider

Like any other provider, you need to register the provider inside `start/app.js` file.

There are 3 separate providers: You'll have to add each of them to the _providers_ array depending on you needs

>NOTE: The **validation** provider should only be included when the `@adonisjs/validator` is installed

```js
const providers = [
  '@adonisjs/adonis-extensions/providers/RequestExtensionProvider',
  '@adonisjs/adonis-extensions/providers/ResponseExtensionProvider',
  '@adonisjs/adonis-extensions/providers/ValidationExtensionProvider'
]
```

## Config

The configuration is saved inside `config/extension.js` file. Tweak it accordingly.

## Docs

To find out more, read the docs [here](https://github.com/stitchng/adonis-extensions).
