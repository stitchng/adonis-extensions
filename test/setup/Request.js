'use strict'

const Macroable = require('./Macroable')

class Request extends Macroable {
  constructor (headers = { 'Host': '127.0.0.1' }) {
    super()
    this.request = { headers, socket: { localPort: null, remotePort: '8080', encrypted: false } }
  }

  static getter (propertyName, propertyGetter) {
    Object.defineProperty(this.prototype, propertyName, {
      enumerable: false,
      configurable: true,
      get: propertyGetter,
      set: function () {}
    })
  }

  accepts (options) {
    return !options
  }

  is (options) {
    return !!options
  }

  protocol () {
    return 'http'
  }

  hostname () {
    return '127.0.0.1'
  }

  ip () {
    return '127.0.0.1'
  }

  method () {
    return 'POST'
  }

  url () {
    return '/user/new/:id'
  }

  header (name) {
    return (this.request.headers[name] || null)
  }
}

module.exports = Request
