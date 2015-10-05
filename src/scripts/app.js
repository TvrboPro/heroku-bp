
angular.module('tvrbo', ['ngRoute', 'tvrbo.controllers', 'tvrbo.factories', 'gettext', 'templates'])
.config(function($routeProvider, $locationProvider) {

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
})

.run(function(gettextCatalog, $lang){

  gettextCatalog.setCurrentLanguage($lang);

});
