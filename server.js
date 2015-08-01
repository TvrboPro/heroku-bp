#!/bin/env node

// var fs = require('fs');
var http = require('http');
// var https = require('https');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var serveStatic = require('serve-static');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var config = require('./controllers/config.js');
var api = require(__dirname + '/controllers/server.api.js');
var cache = require(__dirname + '/controllers/server.cache.js');
var alias = require(__dirname + '/controllers/server.alias.js');


var TvrboApp = function() {

    var self = this;
    self.path = __dirname;

    // LIFECYCLE
    self.terminator = function(signal){
        if(!signal || typeof signal != "string") return console.log('%s | The app is terminating...', (new Date()).toJSON());
        
        console.log('%s | Received %s...', (new Date()).toJSON(), signal);
        process.exit(1);
    };

    self.initializeTerminationHandlers = function(){

        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
        'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGTERM' //, 'SIGUSR2'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };

    // SERVER
    self.initializeCacheRoutes = function() {

        // see server.cache.js
        var cacheRoutes = cache.getRoutes();
        for (var c in cacheRoutes) {
            if(cacheRoutes.hasOwnProperty(c)) {
                self.app.get(c, cacheRoutes[c]);
            }
        }
    }; 

    self.initializeAPIRoutes = function() {

        // see server.api.js
        // automatic generator for app.get('/api/users', func_name), ...

        for(var g in api.routes.get) {
            if(api.routes.get.hasOwnProperty(g)) {
                self.app.get(g, api.routes.get[g]);
            }
        }
        for(var p in api.routes.post) {
            if(api.routes.post.hasOwnProperty(p)) {
                self.app.post(p, api.routes.post[p]);
            }
        }
        for(var t in api.routes.put) {
            if(api.routes.put.hasOwnProperty(t)) {
                self.app.put(t, api.routes.put[t]);
            }
        }
        for(var d in api.routes.delete) {
            if(api.routes.delete.hasOwnProperty(d)) {
                self.app.delete(d, api.routes.delete[d]);
            }
        }
    };

    self.initializeDatabase = function(doneCallback){
        if(config.USE_MONGODB) {

            // Check that the server is listening
            var net = require('net');
            var s = new net.Socket();
        
            var timeout = 2000;
            s.setTimeout(timeout, function() { s.destroy(); });
            s.connect(config.MONGODB_PORT, config.MONGODB_HOST, function() {
                // PORT IS OPEN
                var mongoStr; 
                if(config.MONGODB_USER && config.MONGODB_PASSWORD)
                    mongoStr = 'mongodb://' + config.MONGODB_USER + ':' + config.MONGODB_PASSWORD + '@' + config.MONGODB_HOST + ":" + config.MONGODB_PORT + '/' + config.MONGODB_DB;
                else
                    mongoStr = 'mongodb://' + config.MONGODB_HOST + ':' + config.MONGODB_PORT + "/" + config.MONGODB_DB;

                // MongoDB Event Handlers
                mongoose.connection.on('connecting', function() { console.log('%s | Connecting to MongoDB...', (new Date()).toJSON()); });
                mongoose.connection.on('error', function(error) {
                    console.error('%s | Error in MongoDB connection: ' + error, (new Date()).toJSON());
                    mongoose.disconnect();
                });
                mongoose.connection.on('connected', function() { console.log('%s | MongoDB connected', (new Date()).toJSON()); });
                mongoose.connection.once('open', function() { console.log('%s | MongoDB connection opened', (new Date()).toJSON(), "\n"); });
                mongoose.connection.on('reconnected', function () { console.log('%s | MongoDB reconnected', (new Date()).toJSON(), "\n"); });
                mongoose.connection.on('disconnected', function() {
                    console.log('%s | MongoDB disconnected!', (new Date()).toJSON(), "\n");
                    mongoose.connect(mongoStr, {server: {auto_reconnect:true}});
                });

                mongoose.connect(mongoStr, {server: {auto_reconnect:true}});

                doneCallback(mongoose.connection);
            });
            s.on('data', function(e) {});
            s.on('error', function(e) {
                console.log("-----");
                console.log("ERROR: The Mongo DB Server is not available");
                console.log(e, "-----");
                s.destroy();
                process.exit();
            });
        }
        else 
            doneCallback(null); // continue
    };

    self.initializeServer = function() {

        self.app = express();

        if(config.ALLOW_CORS) {
            self.app.use(function(req, res, next){
                res.setHeader('Access-Control-Allow-Origin', '*');
                next();
            });
        }

        if(config.USE_PRERENDER)
            self.app.use(require('prerender-node').set('prerenderServiceUrl', config.PRERENDER_URL));
        
        self.app.use(bodyParser.json());
        self.app.use(methodOverride('X-HTTP-Method'))          // Microsoft 
        self.app.use(methodOverride('X-HTTP-Method-Override')) // Google/GData 
        self.app.use(methodOverride('X-Method-Override'))      // IBM

        // SERVER SETTINGS
        if(config.ENSURE_WWW && config.DOMAIN) {
            self.app.all(/.*/, function(req, res, next) {
              var host = req.header("host");
              if(host == config.DOMAIN)
                res.redirect(301, "http://www." + config.DOMAIN);
              else
                return next();
            });
        }
        
        if(config.HTTP_USER && config.HTTP_PASSWORD) {
            self.app.use(express.basicAuth(config.HTTP_USER, config.HTTP_PASSWORD));
            console.log((new Date()).toJSON() + " | " + config.APP_NAME + " using HTTP Auth", "\n");
        }

        // Session management
        self.initializeDatabase(function(mongooseConnection){
            // Sessions
            if(config.USE_SESSIONS && config.USE_MONGODB && mongooseConnection) {
                self.app.use(cookieParser());

                self.app.use(session({
                    saveUninitialized: false,
                    resave: false,
                    secret: config.SESSIONS_SECRET,
                    store: new MongoStore({ mongooseConnection: mongooseConnection
                      // db: config.MONGODB_DB,
                      // collection: config.SESSIONS_COLLECTION,
                      // host: config.MONGODB_HOST,
                      // port: config.MONGODB_PORT,
                      // username: config.MONGODB_USER,
                      // password: config.MONGODB_PASSWORD,
                      // autoReconnect: true
                    })
                }));
                console.log((new Date()).toJSON() + " | Storing sessions on collection " + config.SESSIONS_COLLECTION, "\n");
            }

            // API
            self.initializeAPIRoutes();
            if(config.USE_URL_ALIAS) self.app.use(alias);
            if(config.USE_CACHE) self.initializeCacheRoutes();

            // client
            self.app.use(serveStatic(__dirname + "/www", {'index': ['index.html']}));

            // SSL
            if(config.USE_HTTPS) {
                self.privateKey  = fs.readFileSync(config.KEY_FILE, 'utf8');
                self.certificate = fs.readFileSync(config.CERT_FILE, 'utf8');

                self.sslCredentials = {key: privateKey, cert: certificate};
                
                if(config.CA_FILE)
                    self.ca = fs.readFileSync(config.CA_FILE, 'utf8');
            }
        });
    };

    self.initialize = function(cb) {
        if(config.USE_CACHE) cache.populate();
        self.initializeTerminationHandlers();
        self.initializeServer(cb);
    };

    self.start = function() {

        // START SERVER
        var httpServer, httpsServer;
        if(config.USE_HTTP) {
            httpServer = http.createServer(self.app);
            httpServer.listen(config.HTTP_PORT);
        }
        if(config.USE_HTTPS) {
            httpsServer = https.createServer(self.sslCredentials, self.app);
            httpsServer.listen(config.HTTPS_PORT);
        }

        console.log((new Date()).toJSON() + " | " + config.APP_NAME + " listening on port(s)", config.USE_HTTP ? config.HTTP_PORT : "", config.USE_HTTPS ? config.HTTPS_PORT : "", "\n");
    };
};

// MAIN
var tvrboApp = new TvrboApp();
tvrboApp.initialize();
tvrboApp.start();


