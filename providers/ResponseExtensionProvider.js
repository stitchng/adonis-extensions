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
      for (let header in headers) {
        if (headers.hasOwnProperty(header)) {
          this.safeHeader(header, headers[header])
        }
      }
    })

    Response.macro('isEmpty', function () {
      switch (this.response.statusCode) {
        case 304: // Not Modified [HTTP]
        case 204: // No Content [HTTP]
        case 301: // Temp Redirect [HTTP]
        case 302: // Perm Redirect [HTTP]
        case 303: // See-Other Redirect [HTTP]
        case 100: // Continue [HTTP]
          return true
          break

        default:
          return false
          break
      }
    })
  }
}

module.exports = ResponseExtensionProvider
