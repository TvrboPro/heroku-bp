
angular.module('tvrbo', ['ngRoute', 'tvrbo.controllers', 'tvrbo.factories', 'gettext', 'templates'])
.config(function($routeProvider, $locationProvider, $compileProvider) {

    $routeProvider

    // IMPORTANT: CHECK server.alias.js
    .when('/', {
      templateUrl : '/views/main.html',
      controller  : 'MainCtrl'
    })
     .when('/view', {
      templateUrl : '/views/view.html',
      controller  : 'ViewCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });

    // $locationProvider.html5Mode(true);
    
    $compileProvider.debugInfoEnabled(false);
})

.run(function(gettextCatalog, $lang){

  gettextCatalog.setCurrentLanguage($lang);

});
