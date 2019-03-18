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
// const { Config } = require('@adonisjs/sink')
const { ioc } = require('@adonisjs/fold')
const RequestExtensionProvider = require('../providers/RequestExtensionProvider.js')

test.group('AdonisJS [Request] Extensions Provider Test(s)', (group) => {
  group.before(() => {
    ioc.singleton('Adonis/Src/Request', () => {
      let Request = require('./setup/Request.js')
      return Request
    })

    ioc.singleton('Adonis/Src/Route', () => {
      let RouteManager = require('./setup/RouteManager.js')
      return RouteManager
    })
  })

  test('request ext provider boots and auguments target components as expected', async (assert) => {
    let requestExtProvider = new RequestExtensionProvider(ioc)
    requestExtProvider.boot()

    let Request = ioc.use('Adonis/Src/Request')
    let request = new Request({ 'Connection': 'keep-alive', 'Accept': 'text/html' })

    assert.isFunction(request.currentRoute)
    assert.isFunction(request.port)
    assert.isFunction(request.hasJsonBody)
    assert.isFunction(request.expectsJsonBody)
    assert.isFunction(request.hasHeader)
    assert.isFunction(request.userAgent)
  })
})