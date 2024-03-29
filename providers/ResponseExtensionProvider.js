'use strict'

const zlib = require('zlib')
const EventEmitter = require('events')
const { Readable } = require('stream')
const nodeReq = require('node-req')
const onFinished = require('on-finished')
const destroy = require('destroy')
const safeStringify = require('safe-json-stringify')
const { ServiceProvider } = require('@adonisjs/fold')

const entityBody = {
  stream: function streamer (res, body) {
    return new Promise((resolve, reject) => {
      if (typeof (body.pipe) !== 'function') {
        reject(new Error('[adonisjs-extensions]: cannot find a valid read-stream'))
        return
      }

      let finished = false

      /**
     * Error in stream
     */
      body.on('error', (error) => {
        if (finished) {
          return
        }

        finished = true
        destroy(body)

        reject(error)
      })

      /**
     * Consumed stream
     */
      body.on('end', resolve)

      /**
     * Written response
     */
      onFinished(res, function () {
        finished = true
        destroy(body)
      })

      /**
     * Pipe to res
     */
      body.pipe(res)
    })
  }
}

class ResponseExtensionProvider extends ServiceProvider {
  /**
   * Setup 'Content-Type: multipart/x-mixed-replace'
   * response headers and HTTP compression transforms
   * for response.
   *
   *
   * @param {Object} ctx
   * @param {Function} next
   * @param {Array} [-destructured-]
   *
   * @method streamResponseBodyMiddleware
   *
   * @return {undefined}
   */
  async streamResponseBodyMiddleware ({ request, response }, next, [ chunked, multipart ]) {
    const chunkedResponse = response.Config.get('extension.chunkedResponse')
    const [ , charset ] = request.header(
      'Accept',
      '').match(/^(?:[^;]+); charset=(.*)\b|$/) || ['', false]
    const charsets = request.header(
      'Accept-Charset',
      charset || null
    )

    response.transform(
      nodeReq.charset(
        response.request,
        charsets !== null
          ? charsets
            .toLowerCase()
            .replace(/(?:; ?q=\d\.\d{1,}(,\*?)?)+\b|$/g, '')
            .replace(',', ', ').split(', ')
          : ['utf-8', 'iso-8859-1', 'us-ascii', 'iso-10646-ucs-2', 'utf-7']
      ),
      {
        chunked: (chunked === 'chunked' || multipart === 'chunked' || chunkedResponse),
        multipart: (chunked === 'multipart' || multipart === 'multipart')
      })

    /* @HINT: send whitespace chars to client so it (client) doesn't attempt to close connection */
    process.nextTick(() => response.sendToStream('           '))

    return next()
  }

  /**
   * Register namespaces to the IoC container
   *
   * @method register
   *
   * @return {void}
   */
  register () {
    ;//
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
    const Server = this.app.use('Server')

    Server.registerNamed({ 'stream': this.streamResponseBodyMiddleware })

    Response.macro('validationFailed', function (errorMessages) {
      this.status(422).json({
        status: 422,
        code: 'E_VALIDATE_FAILED',
        message: 'Validation Failed',
        errors: errorMessages
      })
    })

    Response.macro('transform', function (encoding = 'utf8', { chunked, multipart }) {
      if (this.willTransform) {
        throw new Error('[adonisjs-extensions]: Cannot call `response.transform()` more than once')
      }

      const compressionIsEnabled = this.Config.get('app.http.compression.enabled')
      this.willTransform = false
      this.__hasSentResponse = false

      if (!this.willTransform) {
        this.willTransform = true
      }

      if (!this.isPending || this.response.finished) {
        this.__hasSentResponse = true
        this._canStream = false
        return this
      }

      class DataEmitter extends EventEmitter {}
      class ReadStream extends Readable {
        constructor (options) {
          super(options)
          this._backPressureQueue = []
        }

        get nextChunk () {
          return this._backPressureQueue.length
            ? this._backPressureQueue.shift()
            : -1
        }

        set nextChunk (chunk) {
          this._backPressureQueue.push(chunk)
        }

        _read () {
          let chunk = null
          while ((chunk = this.nextChunk) !== -1) {
            const pushed = this.push(chunk)
            if (!pushed) {
              break
            }
          }
        }
      }

      const emptySentinel = ''
      const nullishSentinel = ', '
      const TransferEncoding = this.adonisRequest.header('TE', emptySentinel)
      const Encoding = this.adonisRequest.header('Accept-Encoding', nullishSentinel)
      const rawReadStream = new ReadStream({
        highWaterMark: 32 * 1024
      })
      const rawDataEmitter = new DataEmitter()

      this.__stream = rawReadStream
      this.__emitter = rawDataEmitter
      this._canStream = true

      const compressionAlgo = this.Config.get('app.http.compression.algo')

      if (multipart) {
        this.multiPartBoundary = Number(1 + Math.random() * 234567890).toString(16).replace('.', Date.now())
        this.safeHeader('X-Accel-Buffering', 'no')
        this.safeHeader('Cache-Control', 'no-cache, max-age=0, private')
        this.safeHeader('Pragma', 'no-cache')
        this.safeHeader('Age', '0')
        this.safeHeader('Content-Type', `multipart/x-mixed-replace; boundary="${this.multiPartBoundary}"`)
      }

      setImmediate(() => {
        const that = this
        let readStream = that.__stream

        if (compressionIsEnabled) {
          const useGzipAlgo = compressionAlgo === 'gzip'
          const chunkSize = 32 * 1024
          const level = zlib.constants[useGzipAlgo ? 'Z_BEST_SPEED' : 'Z_BEST_COMPRESSION']
          const finishFlush = zlib.constants[useGzipAlgo ? 'Z_SYNC_FLUSH' : 'BROTLI_OPERATION_FLUSH']
          const info = false
          const options = { chunkSize, level, finishFlush, info }
          const gzipStream = useGzipAlgo ? zlib.createBrotliCompress(options) : zlib.createGzip(options)
          readStream = that.__stream.pipe(gzipStream)
        }

        entityBody.stream(that.response, readStream).catch(
          error => that.abortIf(error !== null, error.code === 'ENOENT' ? 404 : 500, `Something unexpected happened: ${error.message}`)
        )
      })

      this.__emitter.on('adonisjs_stream_data', ({ body, notJson, contentType }) => {
        let data = null

        if (!(body instanceof Buffer)) {
          if (typeof body === 'object' && notJson) {
            data = String(body)
          }

          const isJson = !notJson

          if (isJson) {
            data = safeStringify(body)
          }
        }

        const payload = data instanceof Buffer ? data : Buffer.from(data, encoding.replace(/^us-/, ''))

        if (chunked) {
          if (multipart) {
            const isFirstMultipartBlock = this.__stream._backPressureQueue.length === 0
            this.__stream.nextChunk = Buffer.concat([
              Buffer.from(`${isFirstMultipartBlock ? '\r\n' : ''}--${this.multiPartBoundary}\r\n`, 'ascii'),
              Buffer.from(`Content-Type: ${contentType}\r\n`, 'ascii'),
              Buffer.from(`Content-Length: ${payload.length}\r\n\r\n`, 'ascii')
            ])
          } else {
            this.__stream.nextChunk = Buffer.from(`${payload.length}\r\n`, 'ascii')
          }
        }

        this.__stream.nextChunk = payload
      })

      this.implicitEnd = false

      if (Encoding !== nullishSentinel) {
        this.vary('Accept-Encoding')
      }

      this.safeHeader('Connection', 'keep-alive')

      if (TransferEncoding === emptySentinel) {
        if (compressionIsEnabled && Encoding.includes(String(compressionAlgo))) {
          this.safeHeader(
            'Content-Encoding',
            compressionAlgo
          )
        }
      } else {
        if (compressionIsEnabled && TransferEncoding.includes(String(compressionAlgo))) {
          this.safeHeader(
            'Transfer-Encoding',
            `${compressionAlgo}${chunked ? ', chunked' : ''}`
          )
        } else if (chunked) {
          this.safeHeader(
            'Transfer-Encoding',
            'chunked'
          )
        }
      }

      this.response.on('end', () => {
        this._lazyBody.content = null
        this._lazyBody.args = []

        if (chunked) {
          this.__stream.nextChunk = Buffer.from('0\r\n', 'ascii')
          this.__stream.nextChunk = Buffer.from('\r\n', 'ascii')
        } else {
          this.__stream.nextChunk = this._lazyBody.content
        }

        setTimeout(() => {
          this.__emitter = null
          this.__stream = null
        }, 0)
      })

      return this
    })

    Response.macro('sendToStream', (body, multiPartContentType = 'text/plain; charset=utf-8') => {
      if (!this.willTransform) {
        throw new Error('[adonisjs-extensions]: Cannot call `response.sendToStream()` without calling `response.transform()` first')
      }

      const ContentType = this.adonisRequest.header('Accept', '*/*')
      const isNotJSONRequest = !(
        ContentType.includes('application/json') ||
          ContentType.includes('application/graphql')
      )

      if (!this._canStream) {
        if (!this.implicitEnd) {
          this.implicitEnd = true
        }
      }

      if (!this.__hasSentResponse) {
        if (!this._canStream) {
          this._invoke(
            isNotJSONRequest ? 'send' : 'json',
            body,
            [this.Config.get('app.http.etag')]
          )
          return this._canStream
        }

        this.__emitter.emit('adonisjs_stream_data', {
          body,
          notJson: isNotJSONRequest,
          contentType: multiPartContentType
        })
      }

      return this._canStream
    })

    Response.macro('setHeaders', function (headers = {}) {
      if (!(headers instanceof Object) || this.response.headersSent) {
        return false
      }

      for (var header in headers) {
        if (headers.hasOwnProperty(header)) {
          this.safeHeader(header, headers[header])
        }
      }

      return true
    })

    Response.macro('getStatus', function () {
      const statusCode = this.response.statusCode
      return statusCode
    })

    Response.macro('isEmpty', function () {
      let result = false
      switch (this.response.statusCode) {
        case 304: // Not Modified [HTTP]
        case 204: // No Content [HTTP]
        case 301: //  Redirect [HTTP]
        case 302: // Moved Temporarily Redirect [HTTP]
        case 303: // See-Other Redirect [HTTP]
        case 100: // Continue [HTTP]
        case 102: // Processing [HTTP]
          result = true
          break

        default:
          return result
      }

      return result
    })
  }
}

module.exports = ResponseExtensionProvider
