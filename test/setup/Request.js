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

  language (options = ['en']) {
    return options[0]
  }

  cookies () {
    return {}
  }

  get () {
    return {}
  }

  all () {
    return {}
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

  header (name, defaultValue = '') {
    return (this.request.headers[name] || defaultValue || null)
  }
}

module.exports = Request
