'use strict'

class Macroable {
  static macro (methodName, methodBody) {
    this.prototype[methodName] = methodBody
  }
}

module.exports = Macroable
