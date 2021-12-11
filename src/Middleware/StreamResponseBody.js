'use strict'

const nodeReq = require('node-req')

class StreamResponseBody {
  constructor (Config) {
    this.chunkedResponse = Config.get('extension.chunkedResponse')
  }

  async handle ({ request, response }, next) {
    const charsets = request.header('Accept-Charset', null)
    response.transform(
      charsets !== null ? nodeReq.charset(
        response.request,
        ['utf-8', 'utf-7', 'iso-8859-1', 'us-ascii', 'base64']
      ) : 'utf-8',
      this.chunkedResponse
    )

    await next()
  }
}

module.exports = StreamResponseBody
