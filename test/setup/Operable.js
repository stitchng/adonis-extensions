'use strict'

const Engine = function (locals) {
  this.locals = locals
  this.compiler = { generate: function () { return true } }
}

Engine.prototype.render = function (name, data) {
  return this.compiler.generate(name, data)
}

Engine.prototype.context = {}

Engine.prototype.resolve = function (resolvable = '') {
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

class Operable {
  constructor (locals) {
    this.engine = new Engine(locals)
  }

  static global (methodName, methodBody) {
    Engine.prototype.context[methodName] = methodBody
  }
}

module.exports = Operable
