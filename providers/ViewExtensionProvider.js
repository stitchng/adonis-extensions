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
	register() {
		//....
	}

	/**
	 * Attach context getter when all providers have
	 * been registered
	 *
	 * @method boot
	 *
	 * @return {void}
	 */
	boot() {

		const View = this.app.use('Adonis/Src/View')
    
    View.global('toImage', function (source, attributes = {}) {
      let assetsUrl = this.resolve('assetsUrl')
      let { longdesc, name, id, alt } = attributes
      return this.safe(`<img src="${assetsUrl(source)}" ` + (id?`id="{id}" `:'') + (alt?`alt="${alt}" `:'') + (name?`name="${name}" `:'') + (longdesc?`longdesc="${longdesc}" `:'') `/>`)
    })
    
    View.global('toFrame', function(source, attributes = {}){
    let assetsUrl = this.resolve('assetsUrl')
      let { frameborder, scrolling, name, id, alt } = attributes
      return this.safe(`<iframe src="${assetsUrl(source)}" ` + (id?`id="{id}" `:'') + (scrolling?`scrolling="${scrolling}" `:'') + (name?`name="${name}" `:'') + (frameborder?`frameborder="${frameborder}" `:'') `>`)
    })
    
    View.global('prerender', function (routeNameOrAction, routeParams = {}) {
      let route = this.resolve('route')
      let origin = this.resolve('origin')
      return this.safe(`<link rel="prerender" href="${origin}${route(routeNameOrAction, routeParams)}"/>`)
    })
    
    View.global('dnsPrefetch', function (origin, pathName) {
      return this.safe(`<link rel="dns-prefetch" href="${origin}${pathName}"/>`)
    })
    
    View.global('favIcon', function (url) {
      let assetsUrl = this.resolve('assetsUrl')
      return this.safe(`<link rel="shortcut icon" href="${assetsUrl(url)}" type=""/>`)
    })
    
    View.global('end', function (collection = []) {
        if(Array.isArray(collection)){
            return collection.pop()
        }
        return null
    })

    
  }
}

module.exports = ViewExtensionProvider
