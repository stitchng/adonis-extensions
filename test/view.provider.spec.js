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
const ViewExtensionProvider = require('../providers/ViewExtensionProvider.js')

test.group('AdonisJS [View] Extensions Provider Test(s)', (group) => {
  group.before(() => {
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

    ioc.singleton('Adonis/Src/View', () => {
      let View = require('./setup/View.js')
      return View
    })
  })

  test('view ext provider boots and auguments target components as expected', async (assert) => {
    let viewExtProvider = new ViewExtensionProvider(ioc)
    viewExtProvider.boot()

    let View = ioc.use('Adonis/Src/View')
    let view = new View({})

    assert.isFunction(view.engine.resolve('toImage'))
    assert.isFunction(view.engine.resolve('favIcon'))
    assert.isFunction(view.engine.resolve('toFrame'))
    assert.isFunction(view.engine.resolve('toComboBox'))
    assert.isFunction(view.engine.resolve('toTextBox'))
    assert.isFunction(view.engine.resolve('toBigTextBox'))
    assert.isFunction(view.engine.resolve('dnsPrefetch'))
  })
})
