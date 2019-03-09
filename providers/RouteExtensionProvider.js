'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class RouteExtensionProvider extends ServiceProvider {
  async paramsMatchMiddleware (ctx, next, [matchers = '%7B%7D']) {
    const InvalidArgumentException = require('@adonisjs/generic-exceptions').InvalidArgumentException
    const params = ctx.params || {}

    matchers = JSON.parse(unescape(matchers))

    for (var paramKey in matchers) {
      if (matchers.hasOwnProperty(paramKey)) {
        let paramValue = null
        let paramRegexStr = null

        paramValue = params[paramKey] || null
        paramRegexStr = matchers[paramKey] || null

        if ((paramValue !== null) &&
                    (paramRegexStr !== null)) {
          if ((RegExp(paramRegexStr)).test(paramValue)) {
            continue
          }
        } else {
          throw InvalidArgumentException.invoke(`route parameter OR route macther missing`)
        }
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
    const Route = this.app.use('Route')
    const Server = this.app.use('Server')

    /*const escapeRegExp = function (string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
    }*/

    Server.registerNamed({ paramsMatch: this.paramsMatchMiddleware })

    Route.Route.macro('paramsMatch', function (matchers = {}) {
      for (var param in matchers) {
        if (matchers.hasOwnProperty(param)) {
          let matcher = matchers[param]

          if (!(matcher instanceof RegExp)) { // new RegExp()
            break;
          }

          let regexp_str = matcher.toString().replace(/\//g, '')
          matchers[param] = regexp_str
        }
      }

      this.middleware(`paramsMatch:${escape(JSON.stringify(matchers))}`)
      return this
    })
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

module.exports = RouteExtensionProvider
