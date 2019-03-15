'use strict'

class UpdateViewData {
  constructor (Config) {
    this.minifyHtml = Config.get('extension.minifyHTML')
    this.extraSecurityHeaders = Config.get('extension.extraSecurityHeaders')
  }

  async handle ({ request, view }, next) {
    if (typeof view.share === 'function') {
      let port = request.port()

      view.share({
        full_year: `${(new Date()).getFullYear()}`,
        origin: `${request.protocol()}://${request.hostname()}${port ? ':' + port : ''}`
      })
    }

    await next()
  }
}

module.exports = UpdateViewData
