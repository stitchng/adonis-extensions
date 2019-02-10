'use strict';

const Env = use('Env');

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
      'Clear-Site-Data':'"cache", "cookies", "storage", "executionContexts"', // "*"
      'Referrer-Policy': 'origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Feature-Policy': "vibrate 'none'; geolocation 'none'",
      'X-Frame-Options':'DENY'
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
  minifyHTML:false
};
