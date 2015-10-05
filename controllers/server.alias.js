var config = require('./config.js');

// The routes to be redirected to index.html  (see src/scripts/app.js > $routeProvider)
var angularPaths = config.PATH_ALIAS;

if(config.USE_URL_ALIAS) {
    var url = require('url');
    var fs  = require('fs');

    var rg = "";
    for(var i = 0; i < angularPaths.length; i++) {
        if(i == angularPaths.length - 1)
            rg += angularPaths[i];
        else
            rg += angularPaths[i] + "|";
    }
    var regex = new RegExp("^\/(" + rg + ")");
    
    var wwwRoot = process.cwd() + "/src";
    var aliasContent = fs.readFileSync(wwwRoot + '/index.html');


    module.exports = function(req, res, next) {
        var parts = url.parse(req.url);

        var matched = parts.pathname.match(regex);
        if( matched ) {
            res.setHeader('Content-Type', 'text/html');
            res.send(aliasContent);
        }
        else return next();
    };

    console.log((new Date()).toJSON() + " | Enabling HTML5 routes (server.alias.js) for /" + angularPaths.join(' /'));
}
