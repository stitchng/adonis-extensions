'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class RouteExtensionProvider extends ServiceProvider {
  async paramsMatchMiddleware (ctx, next, [matchers = '%7B%7D']) {
    const RouteMisMatchException = require('../src/Exceptions/RouteMisMatchException.js')
    const params = ctx.params || {}

    const _unescape = function (str) {
      /* eslint-disable no-useless-escape */
      return str.replace(/\%(?:[A-F0-9]{2})/g, (hex) => {
        hex = hex.substr(1)

        return String.fromCharCode(parseInt(hex, 16))
      })
      /* eslint-enable no-useless-escape */
    }

    matchers = JSON.parse(_unescape(matchers))

    for (var paramKey in matchers) {
      if (matchers.hasOwnProperty(paramKey)) {
        let paramValue = null
        let paramRegexStr = null
        let errorMsg = `@@adonisjs/Extensions: route parameter/macther missing`

        paramValue = params[paramKey] || null
        paramRegexStr = matchers[paramKey] || null

        if (/*(paramValue !== null) &&*/
                    (paramRegexStr !== null)) {
          if ((new RegExp(paramRegexStr)).test(paramValue)) {
            continue;
          }
          errorMsg = `@@adonisjs/Extensions: route parameter doesn't match`
        }

        throw new RouteMisMatchException(errorMsg)
      }
    }

    // await next to pass the request to next middleware or controller
    await next()
  }

  /**
 * Register namespaces to the IoC container
 *
 * @method register
 *
 * @return {void}
 */
  register () {

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
    const Route = this.app.use('Route')
    const Server = this.app.use('Server')

    /* const escapeRegExp = function (string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
    } */

    const _escape = function (str) {
      return str.replace(/./g, (char, index) => {
        let result = char

        if (('@*_+-./'.indexOf(char) === -1) &&
                (/^(?:[a-zA-Z0-9])$/.exec(char) === null)) {
          result = `%${char.charCodeAt(0).toString(16).toUpperCase()}`
        }

        return result
      })
    }

    Server.registerNamed({ paramsMatch: this.paramsMatchMiddleware })

    Route.Route.macro('paramsMatch', function (matchers = {}) {
      const InvalidArgumentException = require('@adonisjs/generic-exceptions').InvalidArgumentException

      let errorMsg = null

      for (var param in matchers) {
        if (matchers.hasOwnProperty(param)) {
          let matcher = matchers[param]

          if (!(matcher instanceof RegExp)) { // new RegExp()
            errorMsg = `@@adonisjs/Extensions: "${param}" route parameter doesn't have a valid matcher`
            break
          }

          let flags = matcher.flags

          let regexpStr = matcher.toString()

          if (flags) {
            regexpStr = regexpStr.replace(new RegExp(`\\${flags}$`, 'g'), '')
          }

          matchers[param] = regexpStr.replace(/\//g, '')
        }
      }

      if (errorMsg !== null) {
        throw InvalidArgumentException.invoke(errorMsg)
      }

      this.middleware(`paramsMatch:${_escape(JSON.stringify(matchers))}`)
      return this
    })
  }
}

module.exports = RouteExtensionProvider
