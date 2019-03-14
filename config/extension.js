'use strict'

module.exports = {
/*
|-----------------------------------------------------------------
| Security Header
|-----------------------------------------------------------------
|
|
|
|
|
|
*/
  securiyHeader: {
    'Clear-Site-Data': '"cache", "cookies", "storage", "executionContexts"', // "*"
    'Referrer-Policy': 'origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  },

/*
|-----------------------------------------------------------------
| Minify HTML ?
|-----------------------------------------------------------------
|
|
|
|
|
|
*/
  minifyHTML: false
}
