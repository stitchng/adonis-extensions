'use strict'

class Operable {
  static global (methodName, methodBody) {
    this.Engine.prototype.context[methodName] = methodBody
  }
}

module.exports = Operable
