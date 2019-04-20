'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class ResponseExtensionProvider extends ServiceProvider {
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
    const Response = this.app.use('Adonis/Src/Response')

    Response.macro('validationFailed', function (errorMessages) {
      this.status(422).json({
        status: 422,
        code: 'E_VALIDATE_FAILED',
        message: 'Validation Failed',
        errors: errorMessages
      })
    })

    Response.macro('setHeaders', function (headers = {}) {
      if (!(headers instanceof Object)) {
        return false
      }

      for (let header in headers) {
        if (headers.hasOwnProperty(header)) {
          this.safeHeader(header, headers[header])
        }
      }

      return true
    })

    Response.macro('getStatus', function(){
      const statusCode = this.response.statusCode
      return statusCode
    })

    Response.macro('isEmpty', function () {
      let result = false
      switch (this.response.statusCode) {
        case 304: // Not Modified [HTTP]
        case 204: // No Content [HTTP]
        case 301: // Temp Redirect [HTTP]
        case 302: // Perm Redirect [HTTP]
        case 303: // See-Other Redirect [HTTP]
        case 100: // Continue [HTTP]
          result = true
          break

        default:
          return false
      }

      return result
    })
  }
}

module.exports = ResponseExtensionProvider
