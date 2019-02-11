'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class ViewExtensionProvider extends ServiceProvider {

  /**
	 * Register namespaces to the IoC container
	 *
	 * @method register
	 *
	 * @return {void}
	 */
	register() {
		//....
	}

	/**
	 * Attach context getter when all providers have
	 * been registered
	 *
	 * @method boot
	 *
	 * @return {void}
	 */
	boot() {

		const View = this.app.use('Adonis/Src/View')
    
    View.global('count', function (collection = []) {
        if(Array.isArray(collection)){
            return collection.length
        }
        return -1
    })

    
  }
}

module.exports = ViewExtensionProvider
