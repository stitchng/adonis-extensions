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
const ViewExtensionProvider = require('../providers/ViewExtensionProvider.js')
const UpdateDataMiddleware = require('../src/Middleware/UpdateViewData.js')

test.group('AdonisJS Extensions [Middleware] Test(s)', (group) => {
  group.before(() => {
    ioc.singleton('Adonis/Src/Config', () => {
      let config = new Config()
      config.set('extension.minifyHTML', false)
      config.set('extension.extraSecurityHeaders', {})
      return config
    })

    ioc.singleton('Adonis/Src/Request', () => {
      let Request = require('./setup/Request.js')
      return Request
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

  test('setup middleware to work as expected', async (assert) => {
    const context = ioc.use('Adonis/Src/HttpContext')

    let requestExtensionProvider = new RequestExtensionProvider(ioc)
    requestExtensionProvider.boot()

    let viewExtensionProvider = new ViewExtensionProvider(ioc)
    viewExtensionProvider.boot()

    let Request = ioc.use('Adonis/Src/Request')
    let View = ioc.use('Adonis/Src/View')

    context.request = new Request({ 'Connection': 'keep-alive', 'Accept': 'text/html' })
    context.view = new View({})

    const middleware = new UpdateDataMiddleware(ioc.use('Adonis/Src/Config'))
    const engine = View.Engine()

    middleware
      .handle(context, async function () {
        return true
      })
      .then(() => {
        assert.isFalse(middleware.minifyHtml)
        assert.equal(engine.resolve('full_year'), 2019)
        assert.equal(engine.resolve('origin'), 'http://127.0.0.1:8080')
      })
  })
})
