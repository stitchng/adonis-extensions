'use strict'

/*
 * adonis-extensions
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const { Config } = require('@adonisjs/sink')
const { ioc } = require('@adonisjs/fold')
const RequestExtensionProvider = require('../providers/RequestExtensionProvider.js')
const ResponseExtensionProvider = require('../providers/ResponseExtensionProvider.js')
const ViewExtensionProvider = require('../providers/ViewExtensionProvider.js')
const UpdateDataMiddleware = require('../src/Middleware/UpdateViewData.js')

test.group('AdonisJS Extensions [Middleware] Test(s)', (group) => {
  group.before(() => {
    ioc.singleton('Adonis/Src/Config', () => {
      let config = new Config()
      config.set('app.http.etag', false)
      config.set('app.http.compression.algo', 'gzip')
      config.set('app.http.compression.enabled', true)
      config.set('extension.chunkedResponse', false)
      config.set('extension.minifyHTML', false)
      config.set('extension.extraSecurityHeaders', {})
      return config
    })

    ioc.singleton('Server', () => {
      return {
        middlewares: {
          named: {},
          global: []
        },
        registerNamed: function (registrants = {}) {
          for (let registerName in registrants) {
            if (registrants.hasOwnProperty(registerName)) {
              this.middlewares.named[registerName] = registrants[registerName]
            }
          }
        },
        registerGlobal: function (registrants = []) {
          this.middlewares.global.push.apply(
            this.middlewares.global,
            registrants
          )
        }
      }
    })

    ioc.singleton('Adonis/Src/Request', () => {
      let Request = require('./setup/Request.js')
      return Request
    })

    ioc.singleton('Adonis/Src/Response', () => {
      let Response = require('./setup/Response.js')
      return Response
    })

    ioc.singleton('Adonis/Src/View', () => {
      let View = require('./setup/View.js')
      return View
    })

    ioc.singleton('Adonis/Src/Route', () => {
      let RouteManager = require('./setup/RouteManager.js')
      return RouteManager
    })

    ioc.singleton('Adonis/Src/HttpContext', () => {
      return {}
    })
  })

  test('all middlewares should work as expected', async (assert) => {
    const context = ioc.use('Adonis/Src/HttpContext')

    let responseExtensionProvider = new ResponseExtensionProvider(ioc)
    responseExtensionProvider.boot()

    let requestExtensionProvider = new RequestExtensionProvider(ioc)
    requestExtensionProvider.boot()

    let viewExtensionProvider = new ViewExtensionProvider(ioc)
    viewExtensionProvider.boot()

    let Request = ioc.use('Adonis/Src/Request')
    let Response = ioc.use('Adonis/Src/Response')
    let Config = ioc.use('Adonis/Src/Config')
    let View = ioc.use('Adonis/Src/View')

    context.request = new Request({
      'Connection': 'close',
      'Accept': 'text/html',
      'Cache-Control': 'no-cache, proxy-revalidate'
    })
    context.view = new View({})

    const middleware = new UpdateDataMiddleware(Config)

    middleware
      .handle(context, async function () {
        return true
      })
      .then(() => {
        assert.isFalse(middleware.minifyHtml)
        assert.equal(context.view.engine.resolve('full_year'), 2019)
        assert.equal(context.view.engine.resolve('origin'), 'http://127.0.0.1:8080')
      })

    requestExtensionProvider.cacheHeadersMiddleware(context, async function () {
      return true
    }).then(() => {
      assert.equal(
        context.response.header('Cache-Control', ''),
        'no-cache, proxy-revalidate'
      )
    })

    context.request = new Request({ 'Date': (new Date()).toISOString(), 'Accept': 'application/json' })
    context.response = new Response(Config, 200, '{"time": 168940085638 }')
    context.response.adonisRequest = context.request
    context.response.adonisRequest.request = context.response.request
    context.response.adonisRequest.response = context.response.response

    responseExtensionProvider.streamResponseBodyMiddleware(context, async function () {
      return true
    }, ['multipart']).then(() => {
      assert.isTrue(
        context.response.header('Content-Type', '')
          .includes('multipart/x-mixed-replace; boundary="')
      )
      assert.equal(
        context.response.header('Content-Encoding', ''),
        'gzip'
      )
    })

    responseExtensionProvider.streamResponseBodyMiddleware(context, async function () {
      return true
    }, ['chunked']).then(() => {
      assert.isFalse(
        context.response.header('Content-Type', '')
          .includes('multipart/x-mixed-replace; boundary="')
      )
      assert.equal(
        context.response.header('Transfer-Encoding', ''),
        'gzip, chunked'
      )
    })
  })
})
