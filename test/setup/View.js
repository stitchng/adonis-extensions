'use strict'

const Operable = require('./Operable')

const BasePresenter = function () {}

class View extends Operable {
  constructor (locals = null) {
    super(locals)
  }

  get BasePresenter () {
    return BasePresenter
  }

  render (name, data) {
    return this.engine.render(name, data)
  }

  share (locals = {}) {
    if (locals instanceof Object) {
      this.engine.constructor.prototype.locals = locals
    }
  }
}

module.exports = View
