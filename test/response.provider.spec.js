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
//const { Config } = require('@adonisjs/sink')
const { ioc } = require('@adonisjs/fold')
const ResponseExtensionProvider = require('../providers/ResponseExtensionProvider.js')

test.group('AdonisJS [Response] Extensions Provider Test(s)', (group) => {
  group.before(() => {
    ioc.singleton('Adonis/Src/Response', () => {
        let Response = require('./setup/Response.js')
        return Response
    })
  })

  test('response ext provider boots and auguments target components as expected', async (assert) => {
    let responseExtProvider = new ResponseExtensionProvider(ioc)
    responseExtProvider.boot()

    let Response = ioc.use('Adonis/Src/Response')
    let response = new Response()

    assert.isFunction(response.isEmpty)
    assert.isFunction(response.setHeaders)
    assert.isFunction(response.validationFailed)
    assert.isNull(response.response.data)
    
    response.validationFailed(['Error: E_INVALID_SESSION'])

    assert.isString(response.response.data)
  })
})