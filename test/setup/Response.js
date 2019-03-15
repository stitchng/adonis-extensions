'use strict'

const Macroable = require('./Macroable')

class Response extends Macroable {
 
    constructor(statusCode = 0, data = null){
        this.response = { statusCode, data }
        this.headersSent = false
    }

    status(code){
        this.response.statusCode = code
        return this
    }

    json(data){
        if(!data){
            return false
        }

        if(this.response.data === null){
            this.response.data = JSON.stringify(data)
        }

        return true
    }

    safeHeader(headers){
        return true
    }
}

module.exports = Response