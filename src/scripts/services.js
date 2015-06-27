angular.module('tvrbo.services', [])

.factory('API', function($http) {
	return {
		getValue: function() {
			return $http.get("/api/value");
		}
		// , ...
	};
})
.factory('$lang', function(){

	// Detect and provide the current language

	function getQueryParameter( name, url ) {
		if (!url) url = location.href;
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");

		var regexS = "[\\?&]"+name+"=([^&#]*)";
		var regex = new RegExp( regexS );
		var results = regex.exec( url );
		return !results ? null : results[1];
	}

	var language;
	var st = getQueryParameter('lang', location.href);
	if(st) {
		var matches = st.match(/^([a-zA-Z]{2})/);
		if(!matches || !matches[1]) {
			if (window.navigator.userLanguage) language = window.navigator.userLanguage || "en";
			else language = window.navigator.language || "en";
		}
		else {
			language = matches[1];
		}
	}
	else {
		if (window.navigator.userLanguage) language = window.navigator.userLanguage || "en";
		else language = window.navigator.language || "en";
	}

	language = language.substring(0, 2).toLowerCase();
	return language;
});
