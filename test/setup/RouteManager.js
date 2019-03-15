'use strict'

const Macroable = require('./Macroable')

class RouteManager {
  match () {
    return null
  }
}

class Route extends Macroable {

}

RouteManager.Route = Route

module.exports = RouteManager
