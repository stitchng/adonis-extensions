'use strict'

const { Readable, Writable } = require('stream')
const Macroable = require('./Macroable')

class HttpResponse extends Writable {
  constructor (options) {
    super(options)
    this.statusCode = 0
    this.data = null
    this.finished = false
    this._frontPressureQueue = []
  }

  _init ({ statusCode, data }) {
    this.statusCode = statusCode
    this.data = data
  }

  _write (chunk, encoding) {
    this._frontPressureQueue.push({ chunk, encoding })
  }
}

class HttpRequest extends Readable {
  constructor (options) {
    super(options)
    this.check = false
  }
}

class Response extends Macroable {
  constructor (config, statusCode = 0, data = null) {
    super()

    const httpResponse = new HttpResponse({})
    httpResponse._init({ statusCode, data })

    this.Config = config
    this.response = httpResponse
    this.request = new HttpRequest({})
    this.headers = {}
    this.implicitEnd = true
    this.headersSent = false

    this._lazyBody = {
      method: 'send',
      content: null,
      args: []
    }
  }

  get isPending () {
    return this.headersSent || this.response.finished
  }

  header (name, defaultValue = '') {
    return this.headers[name] || defaultValue
  }

  safeHeader (name, value) {
    if (!(name in this.headers)) {
      this.headers[name] = value
      return true
    }
    return false
  }

  abortIf (expression, statusCode) {
    return expression ? this.status(statusCode) : this
  }

  vary (name) {
    return name
  }

  status (code) {
    this.response.statusCode = code
    return this
  }

  json (data) {
    if (!data) {
      return false
    }

    if (this.response.data === null) {
      this.response.data = JSON.stringify(data)
    }

    return true
  }

  _invoke (method, body, [generateEtag]) {
    if (!this.implicitEnd) {
      return true
    }

    this._lazyBody = { method, body, args: [generateEtag] }
  }
}

module.exports = Response
