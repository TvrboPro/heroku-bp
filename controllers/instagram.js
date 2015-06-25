var crypto      = require('crypto');
var request     = require('request');
var curl        = require('curlrequest');
var config      = require('./config.js');

// SERVER AUTH STRING

var instagramAuthString = "";
function updateInstagramAuthString(){
    var hmac = crypto.createHmac('SHA256', config.INSTAGRAM_CLIENT_SECRET);
    hmac.setEncoding('hex');
    hmac.write(config.SERVER_IP);
    hmac.end();

    instagramAuthString = config.SERVER_IP + '|' + hmac.read();
}
// Auto refresh (just in case)
setInterval(updateInstagramAuthString, 1000 * 60);
updateInstagramAuthString();
setTimeout(updateInstagramAuthString, 2000);

// INSTAGRAM API CALLS

exports.searchUser = function(accessToken, username, callback){

    if(!accessToken || !username) {
        if(callback && typeof callback == 'function') return callback({error: "No se ha configurado ninguna cuenta de Instagram"});
        else return;
    }

    var reqData = {
        uri: 'https://api.instagram.com/v1/users/search?count=20&access_token=' + accessToken + '&q=' + encodeURIComponent(username), 
        method: 'GET',
        timeout: 1000 * 20,
        headers: {
            'X-Insta-Forwarded-For': instagramAuthString
        }
    };

    request(reqData, function (error, response, body) {
        handleRequestResponse(error, response, body, callback);
    });
};

exports.getUserInfo = function(accessToken, userid, callback){

    if(!accessToken || !userid) {
        if(callback && typeof callback == 'function') return callback({error: "No se ha configurado ninguna cuenta de Instagram"});
        else return;
    }
    var reqData = {
        uri: 'https://api.instagram.com/v1/users/' + userid + '?access_token=' + accessToken,
        method: 'GET',
        timeout: 1000 * 20,
        headers: {
            'X-Insta-Forwarded-For': instagramAuthString
        }
    };

    request(reqData, function (error, response, body) {
        handleRequestResponse(error, response, body, callback);
    });
};

exports.getUserRelationship = function(accessToken, userid, callback){

    if(!accessToken || !userid) {
        if(callback && typeof callback == 'function') return callback({error: "No se ha configurado ninguna cuenta de Instagram"});
        else return;
    }

    var reqData = {
        uri: 'https://api.instagram.com/v1/users/' + userid + '/relationship?access_token=' + accessToken,
        method: 'GET',
        timeout: 1000 * 20,
        headers: {
            'X-Insta-Forwarded-For': instagramAuthString
        }
    };

    request(reqData, function (error, response, body) {
        handleRequestResponse(error, response, body, callback);
    });
};

exports.getUserRecentPictures = function(accessToken, userid, min_id, max_id, callback){

    if(!accessToken || !userid) {
        if(callback && typeof callback == 'function') return callback({error: "No se ha configurado ninguna cuenta de Instagram"});
        else return;
    }

    var reqData = {
        uri: 'https://api.instagram.com/v1/users/' + userid + '/media/recent/?count=50&access_token=' + accessToken,
        method: 'GET',
        timeout: 1000 * 20,
        headers: {
            'X-Insta-Forwarded-For': instagramAuthString
        }
    };
    if(min_id)
        reqData.uri += "&min_id=" + min_id;
    if(max_id)
        reqData.uri += "&max_id=" + max_id;

    request(reqData, function (error, response, body) {
        handleRequestResponse(error, response, body, callback);
    });
};

exports.getPicturesByHashtag = function(accessToken, hashtag, startID, callback){

    if(!accessToken || !hashtag) {
        if(callback && typeof callback == 'function') return callback({error: "No se ha configurado ninguna cuenta de Instagram"});
        else return;
    }
    hashtag = hashtag.replace(/^#/, '');

    // signing request info
    var parameters = {
        access_token: accessToken,
        count: 50
    }, endpoint = '/tags/' + hashtag + '/media/recent';

    var reqData = {
        uri: 'https://api.instagram.com/v1' + endpoint + '?count=' + parameters.count + '&access_token=' + accessToken + "&sig=" + signInstagramRequest(endpoint, parameters),
        method: 'GET',
        timeout: 1000 * 20,
        headers: {
            'X-Insta-Forwarded-For': instagramAuthString
        }
    };

    if(startID)
        reqData.uri += "&min_tag_id=" + startID;

    request(reqData, function (error, response, body) {
        handleRequestResponse(error, response, body, callback);
    });
};

exports.setLikeOnPicture = function(accessToken, pictureId, callback){

    if(!accessToken || !pictureId) {
        if(callback && typeof callback == 'function') return callback({error: "No se ha configurado ninguna cuenta de Instagram"});
        else return;
    }

    var reqData = {
        uri: 'https://api.instagram.com/v1/media/' + pictureId + '/likes?access_token=' + accessToken,
        method: 'POST',
        timeout: 1000 * 20,
        headers: {
            'X-Insta-Forwarded-For': instagramAuthString
        }
    };

    request(reqData, function (error, response, body) {
        handleRequestResponse(error, response, body, callback);
    });
};


//////////////////////////////////////////////////////////////////////////
// HELPERS

function signInstagramRequest(endpoint, parameters) {
    var hmac;
    var tempStr = endpoint;
    var keys = Object.keys(parameters).sort();
    hmac = crypto.createHmac('SHA256', config.INSTAGRAM_CLIENT_SECRET);
    hmac.setEncoding('hex');
    for(var i = 0; i < keys.length; i++) {
        tempStr += "|" + keys[i] + "=" + parameters[keys[i]];
    }
    hmac.write(tempStr);
    hmac.end();
    return hmac.read();
}

function handleRequestResponse(error, response, body, callback){
    if(error) return callback && callback(error, body, response && response.statusCode || 500, response && response.headers);
    body = body.trim && body.trim();
    if(!body) {
        if(callback && typeof callback == 'function') 
            return callback("Could not connect to Instagram (empty response)", {}, 200, {});
        else
            return;
    }
    
    try {
        body = JSON.parse(body);

        if(body.meta && body.meta.error_type)
            return callback && callback(body.meta, body, response && response.statusCode || 500, response && response.headers);
        else
            return callback && callback(error, body, response && response.statusCode || 500, response && response.headers);
    }
    catch(e) { 
        if(callback && typeof callback == 'function') callback(e);
        console.error("Invalid response from Instagram: ", body);
    }
}

// CURL Request
function handleCurlResponse(error, body, callback){
    if(!body) {
        if(callback && typeof callback == 'function') 
            return callback("Could not connect to Instagram (empty response)", {}, 200, {});
        else
            return;
    }
    
    var headers = {};
    var idx = body.indexOf("\r\n\r\n");
    if(idx != -1) {
        headers = parseHeader(body.substr(0, idx));
        body = body.substr(idx);
        
        if(!body || !body.trim()) {
            if(callback && typeof callback == 'function') 
                return callback("Could not connect to Instagram (empty response)", {}, 200, {});
            else
                return;
        }
    }
    try {
        body = JSON.parse(body);

        if(error) return callback && callback(error, body, headers.statusCode || 500, headers);
        else if(body.meta && body.meta.error_type)
            return callback && callback(body.meta, body, headers.statusCode || 500, headers);
        else
            return callback && callback(error, body, headers.statusCode || 500, headers);
    }
    catch(e) { if(callback && typeof callback == 'function') callback(e); }
}

function parseHeader(headerStr) {
    var result = {};
    var i = 0, pos, key, value;
    var lines = headerStr.split("\r\n");
    if(headerStr.length === 0) return result;

    if(lines[0].indexOf("HTTP") === 0) {
        result.statusCode = parseInt(lines[0].split(" ")[1] || '500');
        i = 1; // skip HTTP/1.1
    }
    for(; i < lines.length; i++) {
        pos = lines[i].indexOf(": ");
        key = lines[i].substr(0, pos);
        if(!key) continue;
        value = lines[i].substr(pos+2);
        result[key] = value;
    }

    return result;
}

