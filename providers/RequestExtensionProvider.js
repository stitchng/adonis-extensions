'use strict'

const murmurhash = require('murmurhash-native')
const { ServiceProvider } = require('@adonisjs/fold')
const url = require('url')

class RequestExtensionProvider extends ServiceProvider {
/**
 * Setup 'Cache-Control' response headers
 * taking into consideration the request
 * 
 * @param {Object} ctx 
 * @param {Function} next 
 * @param {Array} [-destructured-]
 * 
 * @method cacheHeadersMiddleware
 * 
 * @return {Promise}
 */
 async cacheHeadersMiddleware(ctx, next, [directives = 'no-store,max-age=0']){

    let cacheInstructions = ctx.request.header('Cache-Control')
 }

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
    const Request = this.app.use('Adonis/Src/Request')
    const Server = this.app.use('Server')
    const RouteManager = this.app.use('Adonis/Src/Route')

    Request.getter('currentTime', function () {
      return Date.now()
    })

    Request.macro('hasJsonBody', function () {
      return (this.is(['json', 'html']) === 'json')
    })

    Request.macro('expectsJsonBody', function () {
      return (this.accepts(['html', 'json']) === 'json')
    })

    Request.macro('currentRoute', function () {
      let urlParts = url.parse(this.url(), true)
      let route = RouteManager.match(urlParts.pathname, this.method().toUpperCase(), urlParts.host)

      let current = ( route !== null ? route.route.toJSON() : { name: '', route: null, verbs: [], middleware: [], handler: null, domain: null })

      current.isNamed = function(...patterns){

      };

      return current
    })

    Request.macro('fingerprint', function (unique = true) {
       // If requests exceed 1 billion, collion make occur (rate:2%)
      let currentRoute = this.currentRoute()

      if(currentRoute.route === null){
         return null;
      }

      return murmurhash.murmurHash64x86([].concat(
        (unique === true ? [this.method()] : currentRoute.verbs),
        [currentRoute.domain, this.url(), this.ip()]
      ).join('|'));
    })

    Request.macro('port', function () {
      let isSSL = this.secure()

      if (isSSL) {
        return '443'
      }

      return this.request.socket.localPort || this.request.socket.remotePort
    })

    Request.macro('origin', function () {
      let port = this.port()

      return `${this.protocol()}://${this.hostname()}${port ? ':' + port : ''}`
    })

    Request.macro('userAgent', function () {
      return this.header('User-Agent')
    })

    Request.macro('hasHeader', function (headerText) {
      return (typeof this.header(headerText) === 'string')
    })

    Server.registerNamed({ 'cache.headers': this.cacheHeadersMiddleware })
  }
}

module.exports = RequestExtensionProvider
