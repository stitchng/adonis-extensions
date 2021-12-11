## Registering provider

Like any other provider, you need to register the provider inside `start/app.js` file.

There are 5 separate providers: You'll have to add each of them to the _providers_ array depending on you needs

>NOTE: The **validation** provider should only be included when the `@adonisjs/validator` package is installed

```js
const providers = [
  'adonisjs-extensions/providers/RequestExtensionProvider',
  'adonisjs-extensions/providers/ResponseExtensionProvider',
  'adonisjs-extensions/providers/ViewExtensionProvider', // optional
  'adonisjs-extensions/providers/RouteExtensionProvider',
  'adonisjs-extensions/providers/ValidationExtensionProvider'
]
```

>Add Middleware to `start/kernel.js` file

```js
const globalMiddleware = [
  'Adonis/Middleware/Session',
  ...
  'Adonis/Middleware/UpdateViewData',
  'Adonis/Middleware/StreamResponseBody', // optional
]
```

## Config

The configuration is saved inside `config/extension.js` file. Tweak it accordingly.

>NOTE: To set HTTP (dynamic) compression for your AdonisJS server using this library, simply setup your `config/app.js` like so:

```js

'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

module.exports = {

  /*
  |--------------------------------------------------------------------------
  | Application Name
  |--------------------------------------------------------------------------
  |
  | This value is the name of your application and can used when you
  | need to place the application's name in a email, view or
  | other location.
  |
  */

  name: Env.get('APP_NAME', 'Adonis'),

  /*
  |--------------------------------------------------------------------------
  | App Key
  |--------------------------------------------------------------------------
  |
  | App key is a randomly generated 16 or 32 characters long string required
  | to encrypt cookies, sessions and other sensitive data.
  |
  */
  appKey: Env.getOrFail('APP_KEY'),

  http: {
    /*
    |--------------------------------------------------------------------------
    | Allow Method Spoofing
    |--------------------------------------------------------------------------
    |
    | Method spoofing allows to make requests by spoofing the http verb.
    | Which means you can make a GET request but instruct the server to
    | treat as a POST or PUT request. If you want this feature, set the
    | below value to true.
    |
    */
    allowMethodSpoofing: true,

    /*
    |--------------------------------------------------------------------------
    | Trust Proxy
    |--------------------------------------------------------------------------
    |
    | Trust proxy defines whether X-Forwarded-* headers should be trusted or not.
    | When your application is behind a proxy server like nginx, these values
    | are set automatically and should be trusted. Apart from setting it
    | to true or false Adonis supports handful or ways to allow proxy
    | values. Read documentation for that.
    |
    */
    trustProxy: true,

    /*
    |--------------------------------------------------------------------------
    | Subdomains
    |--------------------------------------------------------------------------
    |
    | Offset to be used for returning subdomains for a given request.For
    | majority of applications it will be 2, until you have nested
    | sudomains.
    | cheatsheet.adonisjs.com      - offset - 2
    | virk.cheatsheet.adonisjs.com - offset - 3
    |
    */
    subdomainOffset: 2,

    /*
    |--------------------------------------------------------------------------
    | JSONP Callback
    |--------------------------------------------------------------------------
    |
    | Default jsonp callback to be used when callback query string is missing
    | in request url.
    |
    */
    jsonpCallback: 'callback',


    /*
    |--------------------------------------------------------------------------
    | Etag
    |--------------------------------------------------------------------------
    |
    | Set etag on all HTTP response. In order to disable for selected routes,
    | you can call the `response.send` with an options object as follows.
    |
    | response.send('Hello', { ignoreEtag: true })
    |
    */
    etag: false


    /*
    |--------------------------------------------------------------------------
    | Http Compression
    |--------------------------------------------------------------------------
    |
    | Set compression on all HTTP responses and package them into NodeJS Streams.
    |
    | response.transform('ascii').sendToStream(Date.now())
    |
    */
    compression: {
      enabled: false,
      algo: Env.get('APP_HTTP_COMPRESSION_ALGO', 'gzip')
    }
  },
  ...
}
```

## Docs

To find out more, read the docs [here](https://github.com/stitchng/adonis-extensions).
