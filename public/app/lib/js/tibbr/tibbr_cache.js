define(['order!jquery', 'underscore'], function ($,_) {
    return  (function ($,_, global) {
        var  cacheStore = {},
        expireCacheAfterTimeout = function(k,timer){

            if(cacheStore[k] && cacheStore[k]['expireHandle'])
                    global.clearTimeout(cacheStore[k]['expireHandle']);

            cacheStore[k]['expireHandle'] = global.setTimeout(function(){
                if(cacheStore[k] && cacheStore[k]['expireHandle']){
                    expireCache(k);
                }
            },
            timer*1000)
        }, expireCache = function(key){
            if(key && cacheStore[key]){
                if(cacheStore[key]['expireHandle'])
                    global.clearTimeout(cacheStore[key]['expireHandle']);
                cacheStore[key] = null;
            }
        }

        return {
            write: function(key,data,options){
                var option = _.extend({
                    expire_after: 5
                },options||{});

                cacheStore[key] = {
                    data: data,
                    updated: true
                };
                if(option.expire_after)
                    expireCacheAfterTimeout(key,option.expire_after);

            },
            clear: function(key){
                if(key && cacheStore[key]){
                    expireCache(key)
                }
                else
                    _.each(cacheStore,function(val, key){
                        expireCache(key);
                    })
            },
            read: function(key,options){
                var rawData = cacheStore[key]
                if(rawData)
                    return rawData.data || {};
                else
                    return {
                        error: {
                            code: 0,
                            message: "data is not updated"
                        }
                    }
            }

        }
    })($,_, window);
});