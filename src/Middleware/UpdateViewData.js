'use strict'

class UpdateViewData {

    async handle({ request, view }, next){
    
        if(typeof view.share === 'function'){
            view.share({
                origin: `${request.protocol()}://${request.hostname()}`
            })
        }

        await next()
    }
}

module.exports = UpdateViewData
