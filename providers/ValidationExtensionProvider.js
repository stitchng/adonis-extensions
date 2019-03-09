'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class ValidationExtensionProvider extends ServiceProvider {
  /**
		 * Register namespaces to the IoC container
		 *
		 * @method register
		 *
		 * @return {void}
		 */
  register () {
    // ....
  }

  /**
		 * Attach context getter when all providers have
		 * been registered
		 *
		 * @method boot
		 *
		 * @return {void}
		 */
  boot () {

  }
}

module.exports = ValidationExtensionProvider
