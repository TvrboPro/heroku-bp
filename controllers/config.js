/*jslint node: true */

var nconf = require( 'nconf' );

nconf.env();//.argv();

// nconf.file( '.../config.json' );

var defaults = {
    IS_PRODUCTION: false,
    
    APP_NAME: 'Tvrbo App',
    DOMAIN: 'boilerplate.herokuapp.com',
    ENSURE_WWW: false,
    PATH_ALIAS: ['view'],

    HTTP_PORT: process.env.PORT || 8080,
    HTTPS_PORT: 8443,

    USE_HTTP: true,
    USE_HTTPS: false,
    USE_MONGODB: false,
    USE_PRERENDER: false,
    USE_CACHE: true,
    USE_URL_ALIAS: false,
    ALLOW_CORS: false,

    MONGODB_HOST: 'mongo-server.com',
    MONGODB_PORT: '1234',
    MONGODB_DB: 'dbname',
    MONGODB_USER: '',
    MONGODB_PASSWORD: '',

    HTTP_USER: '',
    HTTP_PASSWORD: '',

    ADMIN_HTTP_USER: '',
    ADMIN_HTTP_PASSWORD: '',


    KEY_FILE: '/etc/pki/tls/private/localhost.key',
    CERT_FILE: '/etc/pki/tls/certs/localhost.crt',
    CA_FILE: '/etc/pki/tls/certs/ca-bundle.crt',

    PRERENDER_URL: 'http://localhost:3000'
};

nconf.defaults(defaults);

var k;
for(k in defaults) {
    if(defaults.hasOwnProperty(k)) {
        exports[k] = nconf.get(k);
    }
}
