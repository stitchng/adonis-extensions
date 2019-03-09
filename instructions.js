'use strict'

/**
 * adonis-extensions
 *
 * @license MIT
 * @copyright Slynova - Romain Lanz <romain.lanz@slynova.ch>
 *
 * @extended Oparand - Ifeora Okechukwu <isocroft@gmail.com> | Aziz Abdul <>
 */

const path = require('path')

module.exports = async function (cli) {
  try {
    await cli.makeConfig('extension.js', path.join(__dirname, './config/extension.js'))
    cli.command.completed('create', 'config/extension.js')
  } catch (error) {
    // ignore if extension.js file already exists
  }
}
