'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class ValidationExtensionProvider extends ServiceProvider {
/**
 * Register namespaces to the IoC container
 *
 * @method register
 *
 * @return {void}
 */
  register () {

  }

  /**
 * Attach context getter when all providers have
 * been registered
 *
 * @method boot
 *
 * @return {void}
 */
  boot () {
    const Validator = this.app.use('Adonis/Addons/Validator')

    const digitStringValidator = async (data, field, message, args, get) => {
      const fieldValue = get(data, field)
      if (!fieldValue) {
        return true
      }

      if (!/^\d+/i.test(fieldValue)) {
        throw message
      }
    }

    const minValueValidator = async (data, field, message, args, get) => {
      const fieldValue = get(data, field)
      if (parseInt(fieldValue) < parseInt(args[0])) {
        throw message
      }
    }

    const maxValueValidator = async (data, field, message, args, get) => {
      const fieldValue = get(data, field)
      if (parseInt(fieldValue) > parseInt(args[0])) {
        throw message
      }
    }

    Validator.extend('digitString', digitStringValidator)
    Validator.extend('maxValue', minValueValidator)
    Validator.extend('maxValue', maxValueValidator)
  }
}

module.exports = ValidationExtensionProvider
