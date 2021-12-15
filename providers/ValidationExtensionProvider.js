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
    ;//
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
      const value = get(data, field)

      if (!value) {
        /**
         * skip validation if value is not defined. `required` rule
         * should take care of it.
         */
        return
      }

      if (!/^(?:[\d]+)$/.test(value)) {
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

    const hasLengthValidator = async (data, field, message, args, get) => {
      const value = get(data, field)

      if (!value ||
             !('length' in value)) {
        /**
         * skip validation if value is not defined. `required` rule
         * should take care of it.
         */
        return
      }

      if (value.length !== Number(args[0])) {
        throw message
      }
    }

    const minLengthValidator = async (data, field, message, args, get) => {
      const value = get(data, field)

      if (!value ||
             !('length' in value)) {
        return true
      }

      if (value.length < Number(args[0])) {
        throw message
      }
    }

    const maxLengthValidator = async (data, field, message, args, get) => {
      const value = get(data, field)

      if (!value ||
             !('length' in value)) {
        /**
         * skip validation if value is not defined. `required` rule
         * should take care of it.
         */
        return true
      }

      if (value.length > Number(args[0])) {
        throw message
      }
    }

    const belowValidator = async (data, field, message, args, get) => {
      const value = get(data, field)

      if (!value ||
             Number.isNaN(Number(value))) {
        /**
         * skip validation if value is not defined. `required` rule
         * should take care of it.
         */
        return
      }

      if (Number(value) >= Number(args[0])) {
        throw message
      }
    }

    const keysValidator = async (data, field, message, args, get) => {
      let value = get(data, field)
      if (!value) {
        /**
         * skip validation if value is not defined. `required` rule
         * should take care of it.
         */
        return true
      }

      const propsAndTypes = args || []
      const propsWithIssues = []
      const propsAndTypesMap = fromPairs(propsAndTypes.map(propAndType => propAndType.trim().split('=')))
      const props = Object.keys(propsAndTypesMap)

      value = typeof value === 'string' ? JSON.parse(value) : value
      if (!(value instanceof Object)) {
        throw new Error(`request payload data with "${field}" property is not of type object`)
      }

      for (let prop in value) {
        let propValue = value[prop]
        const valueType = (prop in propsAndTypesMap) ? propsAndTypesMap[prop] : ''
        propValue = propValue === null ? 'null' : propValue
        /* eslint-disable-next-line valid-typeof */
        const isValidType = valueType === 'object' ? (propValue instanceof Object) : (typeof (propValue) === valueType)

        if (value.hasOwnProperty(prop)) {
          if (!props.includes(prop) || !isValidType) {
            propsWithIssues.push(prop)
          }
        }
      }

      if (propsWithIssues.length > 0) {
        throw new Error(
          `fields: (${String(propsWithIssues)}) are missing or have incorrect type in request payload data; ${message}`
        )
      }
    }

    const notRequiredWhenValidator = async (data, field, message, args, get) => {
      const [ whenField, expectedWhenValue ] = args
      const whenValue = get(data, whenField)
      const value = get(data, field)

      if (!whenValue || String(whenValue) !== String(expectedWhenValue)) {
        /**
         * skip validation if value is not defined. `required` rule
         * should take care of it.
         */
        if (!value) {
          return;
        }
      }
    }

    Validator.extend('digitString', digitStringValidator)
    Validator.extend('minValue', minValueValidator)
    Validator.extend('maxValue', maxValueValidator)
    Validator.extend('below', belowValidator)
    Validator.extend('keys', keysValidator)
    Validator.extend('hasLength', hasLengthValidator)
    Validator.extend('minLength', minLengthValidator)
    Validator.extend('maxLength', maxLengthValidator)
    Validator.extend('notRequiredWhen', notRequiredWhenValidator)
  }
}

module.exports = ValidationExtensionProvider
