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
    ioc.singleton('Adonis/Src/View', () => {
      let View = require('./setup/View.js')
      return View
    })
  })

  test('view ext provider boots and auguments target components as expected', async (assert) => {
    let viewExtProvider = new ViewExtensionProvider(ioc)
    viewExtProvider.boot()

    let View = ioc.use('Adonis/Src/View')
    let engine = new View({})

    assert.isFunction(engine.resolve('toImage'))
    assert.isFunction(engine.resolve('favIcon'))
    assert.isFunction(engine.resolve('toFrame'))
    assert.isFunction(engine.resolve('toComboBox'))
    assert.isFunction(engine.resolve('toTextBox'))
    assert.isFunction(engine.resolve('toBigTextBox'))
    assert.isFunction(engine.resolve('dnsPrefetch'))
  })
})
