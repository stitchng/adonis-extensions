'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class ViewExtensionProvider extends ServiceProvider {
/**
 * Register namespaces to the IoC container
 *
 * @method register
 *
 * @return {void}
 */
  register () {
    this.app.bind('Adonis/Middleware/UpdateViewData', (app) => {
      let UpdateViewDataMiddleware = require('../src/Middleware/UpdateViewData.js')
      let Config = app.use('Adonis/Src/Config')

      return new UpdateViewDataMiddleware(Config)
    })
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
    const View = this.app.use('Adonis/Src/View')
    /* const Server = this.app.use('Server')

    Server.registerGlobal([
      'Adonis/Middleware/UpdateViewData'
    ]) */

    View.global('toImage', function (source, attributes = {}) {
      let assetsUrl = this.resolve('assetsUrl')
      let { longdesc, name, id, alt, className } = attributes

      return this.safe(`<img src="${assetsUrl(source)}"` + (className ? ` class="${className}"` : '') + (id ? ` id="${id}"` : '') + (alt ? ` alt="${alt}"` : '') + (name ? ` name="${name}"` : '') + (longdesc ? ` longdesc="${longdesc}"` : '') + `>`)
    })

    /* eslint-disable no-useless-escape */

    View.global('toButton', function (buttonText, attributes = {}) {
      let { type, tabIndex, disabled, name, id, className } = attributes

      return this.safe(`<button` + (tabIndex ? ` tabindex="${tabIndex}"` : '') + (className ? ` class="${className}"` : '') + (id ? ` id="${id}"` : '') + (type ? ` type="${type}"` : '') + (name ? ` name="${name}"` : '') + (disabled ? ` disabled="${disabled}"` : '') + '>' + buttonText + '<\/button>')
    })

    View.global('toFrame', function (source, attributes = {}) {
      let assetsUrl = this.resolve('assetsUrl')
      let { frameborder, tabIndex, allowtransparency, sandbox, scrolling, name, id, className } = attributes
      return this.safe(`<iframe src="${assetsUrl(source)}"` + (tabIndex ? ` tabindex="${tabIndex}"` : '') + (className ? ` class="${className}"` : '') + (id ? ` id="${id}"` : '') + (scrolling ? ` scrolling="${scrolling}"` : '') + (name ? ` name="${name}"` : '') + (sandbox ? ` sandbox="${sandbox}"` : '') + (allowtransparency ? ` allowtransparency="${allowtransparency}"` : '') + (frameborder ? ` frameborder="${frameborder}"` : '') + '><\/iframe>')
    })

    View.global('toComboBox', function (attributes = {}, options = []) {
      let { name, className, id } = attributes
      return this.safe(`<select` + (id ? ` id="${id}"` : '') + (className ? ` class="${className}"` : '') + (name ? ` name="${name}"` : '') + `>${(options.map(option => '<option value="' + (option.value) + '"' + (option.selected ? ' selected="selected"' : '') + '>' + (option.text) + '<\/option>')).join('\r\n')}<\/select>`)
    })

    View.global('toBigTextBox', function (attributes = {}, defaultValue = '') {
      let { minLength, cols, rows, placeholder, className, name, id, tabIndex } = attributes
      return this.safe(`<textarea` + (id ? ` id="${id}"` : '') + (cols ? ` cols="${cols}"` : '') + (rows ? ` rows="${rows}"` : '') + (className ? ` class="${className}"` : '') + (name ? ` name="${name}"` : '') + (placeholder ? ` placeholder="${placeholder}"` : '') + (minLength ? ` minlength="${minLength}"` : '') + (tabIndex ? ` tabindex="${tabIndex}"` : '') + `>` + (defaultValue || '') + `<\/textarea>`)
    })

    /* eslint-enable no-useless-escape */

    View.global('toTextBox', function (attributes = { autocomplete: 'off' }, defaultValue = '') {
      let { minLength, placeholder, autoComplete, className, name, id, type, tabIndex } = attributes
      return this.safe(`<input` + (id ? ` id="${id}"` : '') + (className ? ` class="${className}"` : '') + (name ? ` name="${name}"` : '') + (type ? ` type="${type}"` : '') + (placeholder ? ` placeholder="${placeholder}"` : '') + (minLength ? ` minlength="${minLength}"` : '') + (defaultValue ? ` value="${defaultValue}"` : '') + (tabIndex ? ` tabindex="${tabIndex}"` : '') + (autoComplete ? ` autocomplete="${autoComplete}"` : '') + `>`)
    })

    View.global('preRender', function (source, routeParams = {}) {
      let route = this.resolve('route')
      let origin = this.resolve('origin')
      source = source.search(/^https?/) === 0 ? source : `${origin}${route(source, routeParams)}`
      return this.safe(`<link rel="prerender" href="${source}">`)
    })

    View.global('dnsPrefetch', function (source, routeParams = {}) {
      let route = this.resolve('route')
      let origin = this.resolve('origin')
      source = source.search(/^https?/) === 0 ? source : `${origin}${route(source, routeParams)}`
      return this.safe(`<link rel="dns-prefetch" href="${source}">`)
    })

    View.global('favIcon', function (source) {
      let assetsUrl = this.resolve('assetsUrl')
      return this.safe(`<link rel="shortcut icon" href="${assetsUrl(source)}" type="image/x-icon">`)
    })

    View.global('end', function (collection = []) {
      if (Array.isArray(collection)) {
        return collection.pop()
      }
      return null
    })
  }
}

module.exports = ViewExtensionProvider
