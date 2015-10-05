var config = require('./config.js');

if(config.IS_PRODUCTION && config.USE_CACHE) {

    var localCache = {};
    var fs = require('fs');

    var wwwRoot = process.cwd() + "/www";

    exports.populate = function() {
        localCache['/'] = fs.readFileSync(wwwRoot + '/index.html');
        localCache['/index.html'] = fs.readFileSync(wwwRoot + '/index.html');
    };

    exports.get = function(key) {
        return localCache[key];
    };

    var func = function(key){
        return function(req, res) {
                    res.setHeader('Content-Type', 'text/html');
                    res.send( localCache[key] );
                };
    };

    exports.getRoutes = function() {
        var result = {};
        for(var key in localCache) {
            if(localCache.hasOwnProperty(key)) {
                result[key] = func(key);
            }
        }
        return result;
    };

    console.log((new Date()).toJSON() + " | Enabling file cache (server.cache.js)");
}
