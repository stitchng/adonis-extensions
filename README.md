# adonis-extensions
An addon/plugin package to provide core extensions for AdonisJS 4.0+

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls][coveralls-image]][coveralls-url]

<img src="http://res.cloudinary.com/adonisjs/image/upload/q_100/v1497112678/adonis-purple_pzkmzt.svg" width="200px" align="right" hspace="30px" vspace="140px">

## Getting Started

```bash

  $ adonis install adonisjs-extensions

```

## Usage

>Using custom context routines for _.edge_ files in **resources/views**

```html

 <div class="variety">
 {{ toImage('images/category-one.jpg', { alt: 'ahoy everyone' }) }} <!-- <img src="/images/category-one.jpg" alt="ahoy everyone"> -->

 {{ toBigTextBox({ name:'tagline', className:'form-box' }, 'Just Say Hi!') }} <!-- <textarea class="form-box" name="tagline">Just Say Hi!</textarea> -->

 - {{ toTextBox({ type:'text', name:'description', placeholder:'Enter Text...', className:'border form-input' }, 'Always opened') }} <!-- <input class="border form-input" name="description" type="text" placeholder="Enter Text..." value="Always opened"> -->

 - {{ toComboBox({ name:'greetings' }, [{text:'Hello',value:'hello'}, {text:'World',value:'world',selected:true}]) }} <!-- <select name="greeting"><option value="hello">Hello</option>
<option value="world" selected="selected">World</option></select> -->

 - {{ toFrame('https://www.example.com', { scrolling:'no' }) }}  <!-- <iframe src="https://www.example.com" scrolling="no"></iframe> -->
 </div>

```

>Using a _paramsMatch()_ custom method in routes for **start/routes.js**

```js

'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

 Route.get('/stats/:category', 'AnalyticsController.getData').as('analytics.stats').paramsMatch({category:/^([a-f0-9]{19})$/})

```

>Use custom methods on the **request** and **response** object(s) of the **HttpContext** object in middlewares/controllers files

```js

'use strict'

const { start, stop } =  require('microjob')

class NodeThreadsManager {

    async handle({ request, response, view }, next){
	    let started = false

        let port = request.port()
        let origin = `${request.protocol()}://${request.hostname()}${port?':'+port:''}`
        
        if(request.currentRoute().name.indexOf('usethread') > -1){
		    await start()
		    started = true
	    }else{
            response.setHeaders(                    {'X-Context-Status':'1'}
            )
        }

        await next()

	    if(started === true){
		    await stop()
	    }
    }
}

module.exports = NodeThreadsManager

```

## License

MIT

## Running Tests

```bash

    npm i

```

```bash

    npm run lint
    
    npm run test

```

## Credits

- [Ifeora Okechukwu <Head Of Technology - Oparand>](https://twitter.com/isocroft)
- [Ahmad Aziz <Head - NodeJS Foundation>](https://instagram.com/dev_amaz)
    
## Contributing

See the [CONTRIBUTING.md](https://github.com/stitchng/adonis-extensions/blob/master/CONTRIBUTING.md) file for info

[npm-image]: https://img.shields.io/npm/v/adonisjs-extensions.svg?style=flat-square
[npm-url]: https://npmjs.org/package/adonisjs-extensions

[travis-image]: https://img.shields.io/travis/stitchng/adonis-extensions/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/stitchng/adonis-extensions

[coveralls-image]: https://img.shields.io/coveralls/stitchng/adonis-extensions/develop.svg?style=flat-square

[coveralls-url]: https://coveralls.io/github/stitchng/adonis-extensions
