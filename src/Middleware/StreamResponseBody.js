'use strict'

const nodeReq = require('node-req')

class StreamResponseBody {
  constructor (Config) {
    this.chunkedResponse = Config.get('extension.chunkedResponse')
  }

  async handle ({ request, response }, next, [ chunked, multipart ]) {
    const [ , charset ] = request.header('Accept', '').match(/^(?:[^;]+); charset=(.*)\b|$/)
    const charsets = request.header(
      'Accept-Charset',
      charset || null
    )

    response.transform(
      nodeReq.charset(
        response.request,
        charsets !== null
          ? charsets.split(', ')
          : ['utf-8', 'utf-7', 'iso-8859-1', 'us-ascii']
      ),
     {
       chunked: (chunked === 'chunked' || multipart === 'chunked' || this.chunkedResponse),
       multipart: (chunked === 'multipart' || multipart === 'multipart')
    )

    /* @HINT: send whitespace chars to client so it (client) doesn't attempt to close connection */
    process.nextTick(() => response.sendToStream('                  '))

    await next()
  }
}

module.exports = StreamResponseBody
