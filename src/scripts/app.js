
angular.module('tvrbo', ['ngRoute', 'tvrbo.services', 'gettext'])
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
    });

    // $locationProvider.html5Mode(true);
})

.run(function(gettextCatalog, $lang){

  gettextCatalog.setCurrentLanguage($lang);

})

.controller('WrapCtrl', function ($scope, $lang, API, gettextCatalog, $sce) {
  $scope.language = $lang;

  $scope.fetchTwitter = function(){

    API.getTweets()
    .success(function(obj, status){
      if(status != 200 || !obj || typeof obj != "object") {
        if(errShown) return;
        errShown = true;
        return console.log(gettextCatalog.getString("Could not connect to the server"));
      }
      if(obj.error)  {
        if(errShown) return;
        errShown = true;
        return console.log(obj.error);
      }

      errShown = false;

      $scope.tweets = obj;
      function makeTwitterUser(txt, pos){ return '<strong><a href="http://twitter.com/' + txt.substr(1) + '" target="_blank">' + txt + '</a></strong>'; }
      function makeTwitterHashtag(txt, pos){ return '<strong><a href="http://twitter.com/hashtag/' + txt.substr(1) + '" target="_blank">' + txt + '</a></strong>'; }
      function makeURL(txt, pos){ return '<strong><a href="' + txt + '" target="_blank">' + txt + '</a></strong>'; }

      for(var i = 0; i < $scope.tweets.length; i++) {
        $scope.tweets[i].text = $sce.trustAsHtml($scope.tweets[i].text
          .replace(".,,,", " ").replace(".,", "")
          .replace(/@[a-zA-Z0-9_\-]+/g, makeTwitterUser)
          .replace(/#[a-zA-Z0-9_\-]+/g, makeTwitterHashtag)
          .replace(/http[s]?:\/\/t.co\/[a-zA-Z0-9]+/g, makeURL));
      }
      $scope.updateEntries();
    })
    .error(function(){
      if(!errShown) {
        console.log(gettextCatalog.getString("Could not load the social feed"));
        errShown = true;
      }
    });
  };

  $scope.fetchInstagram = function(){
    API.getImages()
    .success(function(obj, status){
      if(status != 200 || !obj) return console.log(gettextCatalog.getString("Could not connect to the server"));
      if(obj.error) return console.log(obj.error);

      $scope.instagrams = obj;
      $scope.updateEntries();
    })
    .error(function(){
        console.log(gettextCatalog.getString("Could not load the social feed"));
    });
  };


  // $interval($scope.fetchInstagram, 1000 * 13);
  // $interval($scope.fetchTwitter, 1000 * 17);

  // $scope.fetchInstagram();
  // $scope.fetchTwitter();
})

.controller('MainCtrl', function ($scope, gettextCatalog) {

})

.controller('ViewCtrl', function ($scope, gettextCatalog) {

});
