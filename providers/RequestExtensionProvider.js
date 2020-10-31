'use strict'

// const murmurhash = require('murmurhash-native')
const { ServiceProvider } = require('@adonisjs/fold')
const url = require('url')
const mhash3 = require('../src/libs/murmur-hash.3.js');

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
  async cacheHeadersMiddleware (ctx, next, directives = ['no-store', 'max-age=0']) {
    ctx.response.implicitEnd = true

    await next()

    if (ctx.request.isMethodCacheable() || !ctx.response.isEmpty()) {
      let clientInstructions = ctx.request.header('Cache-Control')

      if (typeof clientInstructions === 'string' &&
          clientInstructions.length > 3 &&
            clientInstructions.indexOf(',') + 1) {
        clientInstructions = clientInstructions.split(',')
      }

      if (Array.isArray(directives)) {
        this.setDirectives(ctx, directives)
      }
    }

    return ctx.response.end()
  }

  setDirectives (ctx, directives) {
    if (ctx.response.isPending) {
      ctx.response.header('Cache-Control', directives.join(','))
    }
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

    Server.registerNamed({ 'cache.headers': this.cacheHeadersMiddleware })

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

      let current = (route !== null ? route.route.toJSON() : { name: '', route: null, verbs: [], middleware: [], handler: null, domain: null })

      current.isNamed = function (...patterns) {
        let routeName = this.name

        if (!routeName) {
          return false
        }

        for (let i = 0; i < patterns.length; i++) {
          let pattern = patterns[i]

          if (pattern === this.name) {
            return true
          }

          pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

          pattern = pattern.replace(/\\\*/gm, '.*')

          if ((new RegExp(pattern)).test(this.name)) {
            return true
          }
        }

        return false
      }

      return current
    })

    Request.macro('fingerprint', function (unique = true) {
      // If requests exceed 1 billion, collion make occur (rate:2%)
      let currentRoute = this.currentRoute()

      if (currentRoute.route === null) {
        return null
      }

      const key = ([].concat(
        (unique === true ? [this.method()] : currentRoute.verbs),
        [currentRoute.domain, this.url(), this.ip()]
      ).join('|'));
      
      const hash = mhash3.hashBytes(key, key.length, 10);
      
      return (new Number(Math.abs(hash) % 262144).toString(16)); 
    })

    Request.macro('referer', function () {
      return this.header('Referer')
    })

    Request.macro('isMethodCacheable', function () {
      let method = this.method().toLowerCase()

      return (method === 'get' || method === 'head')
    })

    Request.macro('port', function () {
      let hasSSL = this.secure()

      if (hasSSL) {
        return '' // port: 443
      }

      return this.request.socket.localPort || this.request.socket.remotePort
    })

    Request.macro('origin', function () {
      let port = this.port()

      return `${this.protocol()}://${this.hostname()}${port !== '' ? ':' + port : ''}`
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
