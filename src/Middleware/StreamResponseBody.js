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
          ? charsets.toLowerCase().replace(/(?:; ?q=\d\.\d{1,}(\,\*?)?)+\b|$/g, '').replace(',', ', ').split(', ')
          : ['utf-8', 'iso-8859-1', 'us-ascii', 'iso-10646-ucs-2', 'utf-7']
      ),
     {
       chunked: (chunked === 'chunked' || multipart === 'chunked' || this.chunkedResponse),
       multipart: (chunked === 'multipart' || multipart === 'multipart')
    })

    /* @HINT: send whitespace chars to client so it (client) doesn't attempt to close connection */
    process.nextTick(() => response.sendToStream('                  '))

    await next()
  }
}

module.exports = StreamResponseBody
