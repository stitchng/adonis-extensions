'use strict'

const Operable = require('./Operable')

class View extends Operable {
  constructor (locals = null) {
    super()
    this.constructor.Engine.prototype.locals = locals
  }

  share (locals = {}) {
    if (locals instanceof Object) {
      this.constructor.Engine.prototype.locals = locals
    }
  }
}

View.Engine = function () { }

View.Engine.prototype.context = {}

View.Engine.prototype.resolve = function (resolvable = '') {
  if (typeof resolvable !== 'string') {
    return null
  }

  if (this.locals[resolvable]) {
    return this.locals[resolvable]
  }

  if (this.context[resolvable]) {
    return this.context[resolvable]
  }
}
