'use strict'

class StreamResponseBody {
  constructor (Config) {
    this.chunkedResponse = Config.get('extension.chunkedResponse')
  }

  async handle ({ response }, next) {
    response.transform(
      'utf8',
      this.chunkedResponse
    )

    await next()
  }
}

module.exports = StreamResponseBody
