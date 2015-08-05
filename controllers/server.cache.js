var config = require('./config.js');

if(config.USE_CACHE && config.IS_PRODUCTION) {

    var localCache = {};
    var fs = require('fs');

    var wwwRoot = __dirname + "/../www";

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
