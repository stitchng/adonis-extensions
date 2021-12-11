'use strict'

const zlib = require('zlib');
const EventEmitter = require('events');
const { Readable } = reequire('stream');
const nodeRes = require('node-res');
const safeStringify = require('safe-json-stringify')
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
    this.app.bind('Adonis/Middleware/StreamResponseBody', (app) => {
      let StreamResponseBodyMiddleware = require('../src/Middleware/StreamResponseBody.js')
      let Config = app.use('Adonis/Src/Config')

      return new StreamResponseBodyMiddleware(Config)
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
    const Response = this.app.use('Adonis/Src/Response')

    Response.macro('validationFailed', function (errorMessages) {
      this.status(422).json({
        status: 422,
        code: 'E_VALIDATE_FAILED',
        message: 'Validation Failed',
        errors: errorMessages
      })
    })

    Response.macro('transform', function (encoding = 'utf8', chunked = false, multipart = false) {
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
      }

      if (!compressionIsEnabled || this.__hasSentResponse) {
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
          return this._backPressureQueue.shift()
        }

        set nextChunk (chunk) {
          this._backPressureQueue.push(chunk)
        }

        _read () {
          try {
            let chunk = null
            while (null !== (chunk = this.nextChunk)) {
              const pushed = this.push(chunk)
              if (!pushed) {
                break;
              }
            }
          } catch (err) {
            this.destroy(err)
          }
        }
      }

      const emptySentinel = ''
      const nullishSentinel = ', '
      const TransferEncoding = this.adonisRequest.header('TE', emptySentinel)
      const Encoding = this.adonisRequest.header('Accept-Encoding', nullishSentinel)
      const rawReadStream = new ReadStream({
        highWaterMark: 32 * 1024,
        encoding
      })
      const rawDataEmitter = new DataEmitter()

      this.__stream = rawReadStream
      this.__emitter = rawDataEmitter
      this._canStream = true

      const compressionAlgo = this.Config.get('app.http.compression.algo')

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

        nodeRes.stream(that.response, readStream).catch(
          error => that.abortIf(true, 500, `Something unexpected happend: ${error.message}`)
        )
      })

      this.__emitter.on('adonisjs_stream_data', ({ body, notJson }) => {
        const data = notJson || typeof body !== 'object' ? String(body) : safeStringify(body)
        const payload = data instanceof Buffer ? data : Buffer.from(data, encoding.replace(/^us-/, ''))

        if (chunked) {
          if (multipart) {
            this.safeHeader(
              'Content-Length',
              String(payload.length)
            )
            this.__stream.nextChunk = `\r\n`
          } else {
            this.__stream.nextChunk = `${payload.length}\r\n`
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
        if (Encoding.includes(String(compressionAlgo))) {
          this.safeHeader(
            'Content-Encoding',
            compressionAlgo
          )
        }
      } else {
        if (TransferEncoding.includes(String(compressionAlgo))) {
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
          this.__stream.nextChunk = `0\r\n`
          this.__stream.nextChunk = `\r\n`
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

    Response.macro('sendToStream', (body) => {
      if (!this.willTransform) {
        throw new Error('@adonisjs-extensions: Cannot call `response.sendToStream()` without calling `response.transform()` first')
      }

      const ContentType = this.adonisRequest.header('Accept', '*/*')
      const isNotJSONRequest = !(
        ContentType.includes('application/json')
          || ContentType.includes('application/graphql')
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
          return false
        }

        this.__emitter.emit('adonisjs_stream_data', { body, notJson: isNotJSONRequest })
      }

      return true
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
