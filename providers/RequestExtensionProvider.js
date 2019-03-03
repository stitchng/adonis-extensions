'use strict'

const { ServiceProvider } = require('@adonisjs/fold')
const url = require('url')

class RequestExtensionProvider extends ServiceProvider {

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

		const Request = this.app.use('Adonis/Src/Request')
    		const RouteManager = this.app.use('Adonis/Src/Route')

	    	Request.getter('currentTime', function () {
	      		return new Date().getTime()
	    	})

	    	Request.macro('hasJsonBody', function() {
	      		return (this.is(['json', 'html']) === 'json')
	    	})

	    	Request.macro('expectsJsonBody', function() {
	      		return (this.accepts(['html', 'json']) === 'json')
	    	})

		Request.macro('currentRoute', function () {
			let url_parts = url.parse(this.url(), true)
			let route = RouteManager.match(url_parts.pathname, this.method().toUpperCase(), url_parts.host)

			return route !== null ? route.route.toJSON() : { name: "", route: null, verbs: [], middleware: [], handler: null, domain: null }
		})

		Request.macro('userAgent', function () {
			return this.header('User-Agent')
		})

		Request.macro('hasHeader', function (headerText) {
			return (typeof this.header(headerText) === 'string')
		})
  }
}

module.exports = RequestExtensionProvider