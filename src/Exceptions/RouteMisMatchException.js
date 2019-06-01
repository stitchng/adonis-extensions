'use strict'

const { HttpException } = require('@adonisjs/generic-exceptions')

class RouteMisMatchException extends HttpException {
  constructor (message) {
    super(message, 500, 'E_ROUTE_MISMATCH')
  }
}

module.exports = RouteMisMatchException
