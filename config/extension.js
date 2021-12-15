'use strict'

module.exports = {
  /*
  |-----------------------------------------------------------------
  | Extra Security Header
  |-----------------------------------------------------------------
  |
  |
  |
  |
  |
  |
  */
  extraSecurityHeaders: {
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
  minifyHTML: false,

  /*
  |-----------------------------------------------------------------
  | Chunked HTTP Response
  |-----------------------------------------------------------------
  |
  |
  |
  |
  |
  |
  */
  chunkedResponse: false
}
