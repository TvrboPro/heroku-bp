
angular.module('tvrbo.controllers', [])

.controller('AppCtrl', function ($rootScope, API, gettextCatalog, $location) {
  $rootScope.value = "";

  API.getValue()
  .success(function(data, status){
  	if(!data) return alert(gettextCatalog.getString("Unable to connect to the server"));
  	else if(data.error) return alert(data.error);
  	else if(data.url) return $location.path(data.url);

  	$rootScope.value = data;
  })
  .error(function(data, status){
  	alert(gettextCatalog.getString("Unable to connect to the server"));
  	console.error(data);
  });
})

.controller('MainCtrl', function ($scope, gettextCatalog) {

})

.controller('ViewCtrl', function ($scope, gettextCatalog) {

});
