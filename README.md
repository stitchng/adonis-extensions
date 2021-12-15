# adonis-extensions
An addon/plugin package to provide core extensions for AdonisJS 4.x+

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls][coveralls-image]][coveralls-url]

<img src="http://res.cloudinary.com/adonisjs/image/upload/q_100/v1497112678/adonis-purple_pzkmzt.svg" width="200px" align="right" hspace="30px" vspace="140px">

## Getting Started

>Please ensure you read the **instructions.md** file to get the best information about how to setup this package for optimal use

```bash

  $ adonis install adonisjs-extensions

```

## Usage

>Using custom context routines for _.edge_ files in **resources/views**

```html

<!-- The http origin of the wep app is available as a global view variable in the .edge view file(s) -->
 <link rel="canonical" href="{{ origin }}/user/me">

 <div class="wrapper">
 {{ toButton('Send', { className:'btn-primary btn', id:'submit' }) }} <!-- <button  id="submit" class="btn-primary btn">Send</button> -->

 {{ toImage('images/category-one.jpg', { alt: 'ahoy everyone' }) }} 
 <!-- <img src="http:127.0.0.1:3333/public/images/category-one.jpg" alt="ahoy everyone"> -->

 {{ toBigTextBox({ name:'tagline', className:'form-box' }, 'Just Say Hi!') }}
 <!-- <textarea class="form-box" name="tagline">Just Say Hi!</textarea> -->

 {{ toTextBox({ type:'text', name:'description', placeholder:'Enter Text...', className:'border form-input' }, 'Always opened') }} 
 <!-- <input class="border form-input" name="description" type="text" placeholder="Enter Text..." value="Always opened"> -->

 {{ toComboBox({ name:'greetings' }, [{text:'Hello',value:'hello'}, {text:'World',value:'world',selected:true}]) }} 
 <!-- <select name="greeting"><option value="hello">Hello</option>
<option value="world" selected="selected">World</option></select> -->

 {{ toFrame('https://www.example.com', { scrolling:'no' }) }}  
 <!-- <iframe src="https://www.example.com" scrolling="no"></iframe> -->

 {{ favIcon('images/favicon.ico') }} 
 <!-- <link rel="shortcut icon" href="http://127.0.0.1:3333/public/images.favicon.ico" type="image/x-icon">  -->
 </div>

 <footer>
    <!-- The full year can be included for using the global view variable too -->
    <p> Copyright &copy; {{ full_year }}. All Rights Reserved </p>
 </footer>

```

>Using a _paramsMatch()_ custom method in routes for **start/routes.js** (to sanitize route parameters at the start of the request cycle). A Cache headers
middleware is available for use to set caching prefereces for assets

```js

'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

 Route.get('/insights/stats/:category', 'AnalyticsController.getInsights')
    .as('analytics.stats')
    .paramsMatch({category:/^([a-f0-9]{19})$/})
    .middleware(['cache.headers:private,must-revalidate,max-age=6800'])

```

>Use custom methods on the **request** and **response** object(s) of the **HttpContext** object in middlewares/controllers files

```js

'use strict'

class RouteNameAndRequestChecker {

    async handle({ request, response }, next){
	    let isAjax = request.ajax()
      // get the origin of the adonisjs server
      let origin = request.origin()
      // get the request fingerprint of the adonisjs server (unique per request)
      let fingerprint = request.fingerprint()

      if (!origin.contains('.oaksearch.com.ng')
            && request.currentRoute().isNamed('analytics.*')) { // 'analytics.stats' route will pass here
 
        // set multiple headers safely in one go.
        response.setHeaders({
          'X-App-Recall-Count': '1',
          'X-Request-Fingerprint': fingerprint
        })

        const delay = function callback (time) {
          return new Promise((resolve) => {
            return setTimeout(resolve, time)
          })
        }

        // Transform the response so that it is streamed (NodeJS streams)
        /** @HINT: 
                
          setup HTTP (NodeJS streamed) response as chunked and HTTP "Content-Type: multipart/x-mixed-replace" 
          using utf-8 encoding 
        */
        response.transform('utf8', { chunked: true, multipart: true })

        if (isAjax) {
          for (let count = 0; count < 5; count++) {
            if (count === 4) {
              // EOF sentinel to signal to the NodeJS stream
              // to close and trigger and end to the response
              // write-stream
              response.sendToStream(null)
              break;
            }

            // delay with a promise using `setTimeout()`
            await delay(count * 1000)

            // send data to the NodeJS stream (read-stream)
            // first argument is the data you wish to send to the HTTP client
            // second argument is the conten-type of the mutipart section for "Content-Type: multipart/x-mixed-replace"
            response.sendToStream({ time: Date.now() }, 'application/json; charset=utf-8')
          }
          return;
        }
      }

      await next();
    }
}

module.exports = RouteNameAndRequestChecker
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
- [Ahmad Abdul-Aziz <Software Engineer>](https://twitter.com/dev_amaz)
    
## Contributing

See the [CONTRIBUTING.md](https://github.com/stitchng/adonis-extensions/blob/master/CONTRIBUTING.md) file for info

[npm-image]: https://img.shields.io/npm/v/adonisjs-extensions.svg?style=flat-square
[npm-url]: https://npmjs.org/package/adonisjs-extensions

[travis-image]: https://img.shields.io/travis/stitchng/adonis-extensions/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/stitchng/adonis-extensions

[coveralls-image]: https://img.shields.io/coveralls/stitchng/adonis-extensions/master.svg?style=flat-square

[coveralls-url]: https://coveralls.io/github/stitchng/adonis-extensions

## Support 

**Coolcodes** is a non-profit software foundation (collective) created by **Oparand** - parent company of StitchNG, Synergixe based in Abuja, Nigeria. You'll find an overview of all our work and supported open source projects on our [Facebook Page](https://www.facebook.com/coolcodes/).

>Follow us on facebook if you can to get the latest open source software/freeware news and infomation.

Does your business depend on our open projects? Reach out and support us on [Patreon](https://www.patreon.com/coolcodes/). All pledges will be dedicated to allocating workforce on maintenance and new awesome stuff.
