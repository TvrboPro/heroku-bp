var config = require('./config.js');
var instagram = require('./instagram.js');
var twitter = require('twitter');
var getIP = require('external-ip')();

var Tweets = require('../models/tweets.js');
var Instagrams = require('../models/instagrams.js');

var images = [];
var tweets = [];
var state = "pre";

var availableTweets = [];
var availableImages = [];

function updateServerIP(){
  getIP(function (err, ip) {
    if (err) return console.log("IP UPDATE ERROR", err);
    config.SERVER_IP = ip;
  });
}
setInterval(updateServerIP, 1000 * 60 * 60);
updateServerIP();

// INIT
function init(){
  Instagrams.find({}, function(err, imgs){
    if(err) return console.log((new Date()).toJSON() + " | Restore Instagram Error:", err);
    if(imgs && typeof imgs == "object" && imgs.length > 0) {
      images = imgs;
      images.sort(function(a, b){ if(a.date < b.date) return -1; else if(a.date > b.date) return 1; else return 0; });
      console.log((new Date().toJSON() + " | Restored " + imgs.length + " images"));
    }
  });
  
  Tweets.find({}, function(err, tws){
    if(err) return console.log((new Date()).toJSON() + " | Restore Twitter Error:", err);
    if(tws && typeof tws == "object" && tws.length > 0) {
      tweets = tws;
      tweets.sort(function(a, b){ if(a.date < b.date) return -1; else if(a.date > b.date) return 1; else return 0; });
      console.log((new Date().toJSON() + " | Restored " + tws.length + " tweets"));
    }
  });
}
// do it
init();

//
if(config.ENABLE_INSTAGRAM) {

  var fetchInstagram = function(){

    instagram.getPicturesByHashtag(config.INSTAGRAM_ACCESS_TOKEN, config.HASHTAG, null, function(error, posts, statusCode, headers){
      if(error || statusCode != 200) {
        console.log("INSTAGRAM: Unable to process the timeline for", config.HASHTAG, statusCode, error);
        return;
      }
      else if(!posts.data) {
        return console.log("INSTAGRAM: Empty posts");
      }
      
      var tmpPosts = [];
      posts.data.forEach(function(post){
        if(post.type == "video") return;
        if(!(post.images && post.images.low_resolution && post.images.low_resolution.url)) return;

        tmpPosts.push({
          link: post.link,
          imageURL: post.images && post.images.low_resolution && post.images.low_resolution.url,
          // caption: (post.caption && post.caption.text) || "",
          date: new Date(post.created_time * 1000),
        });
      });

      // insert non-duplicates only
      tmpPosts.forEach(function(post){
        var found = false;
        for(var i = 0; i < availableImages.length; i++) { // not already available
          if(availableImages[i].link == post.link) { found = true; break; }
        }
        for(i = 0; i < images.length && !found; i++) { // not already in prod
          if(images[i].link == post.link) { found = true; break; }
        }
        if(!found) {
          availableImages.unshift(post);
        }
      });

      availableImages.sort(function(a, b){return b.date-a.date});
      if(availableImages.length > 80) availableImages.splice(80);
    });
  }

  setInterval(fetchInstagram, 1000 * 7);
  setTimeout(fetchInstagram, 1000);
}


// TWITTER SET UP
if(config.ENABLE_TWITTER) {
  var twitterClient = new twitter({
    consumer_key: config.TWITTER_CONSUMER_KEY,
    consumer_secret: config.TWITTER_CONSUMER_SECRET,
    access_token_key: config.TWITTER_ACCESS_TOKEN,
    access_token_secret: config.TWITTER_ACCESS_TOKEN_SECRET
  });

  twitterClient.stream('statuses/filter', {track: config.HASHTAG},  function(stream){
    console.log("TWITTER: Stream ready", config.HASHTAG);

    stream.on('data', function(tweet) {

      var newTweet = {
        isRetweet: false
      };

      if(tweet.retweeted_status) newTweet.isRetweet = true;

      newTweet.id = tweet.id_str;
      newTweet.screen_name = tweet.user.screen_name;
      newTweet.user_name = tweet.user.name;
      newTweet.text = tweet.text;
      newTweet.lang = tweet.lang;
      newTweet.date = new Date(tweet.created_at); 

      availableTweets.unshift(newTweet);
      if(availableTweets.length > 30) availableTweets.splice(30);
    });

    stream.on('error', function(error) {
      console.log("TWITTER ERROR:\n", error);
    });
  });
}

// De 'available' a 'producció'
exports.promoteTweet = function(req, res){
  if(!req.body.id) return res.send({error: "No ID"});

  for(var i = 0; i < availableTweets.length; i++) {
    if(availableTweets[i].id == req.body.id) {

      // mem
      tweets.unshift(availableTweets[i]);
      // DB
      (new Tweets({id: availableTweets[i].id, screen_name: availableTweets[i].screen_name, user_name: availableTweets[i].user_name, text: availableTweets[i].text, date: availableTweets[i].date})).save(function(err){ if(err) console.log(err); });
      
      // només les 20 primeres
      for(var j = 20; j < tweets.length; j++) {
        if(!tweets[j] || !tweets[j].id) continue;
        Tweets.remove({id: tweets[j].id}, function(){});
      }
      if(tweets.length > 20) tweets.splice(20);

      availableTweets.splice(i, 1);

      return res.send({ availableImages: availableImages, availableTweets: availableTweets, prodImages : images, prodTweets: tweets});
    }
  }
  res.send({error: "No such tweet"});
};

// De 'available' a 'producció'
exports.promoteImage = function(req, res){
  if(!req.body.link) return res.send({error: "No link"});

  for(var i = 0; i < availableImages.length; i++) {
    if(availableImages[i].link == req.body.link) {

      // mem
      images.unshift(availableImages[i]);
      // DB
      (new Instagrams({link: availableImages[i].link, imageURL: availableImages[i].imageURL, date: availableImages[i].date})).save(function(err){ if(err) console.log(err); });
      
      // només els 20 primers
      for(var j = 20; j < images.length; j++) {
        if(!images[j] || !images[j].id) continue;
        Instagrams.remove({id: images[j].id}, function(){});
      }
      if(images.length > 20) images.splice(20);
      
      availableImages.splice(i, 1);

      return res.send({ availableImages: availableImages, availableTweets: availableTweets, prodImages : images, prodTweets: tweets});
    }
  }
  res.send({error: "No such image"});
};

// De 'producció' a 'available'
exports.removeTweet = function(req, res){
  if(!req.params.id) return res.send({error: "No ID"});

  for(var i = 0; i < tweets.length; i++) {
    if(tweets[i].id == req.params.id) {

      availableTweets.unshift(tweets[i]);
      if(availableTweets.length > 30) availableTweets.splice(30);

      // DB
      Tweets.remove({id: tweets[i].id}, function(err){ if(err) console.log(err); });
      tweets.splice(i, 1);

      return res.send({ availableImages: availableImages, availableTweets: availableTweets, prodImages : images, prodTweets: tweets});
    }
  }
  res.send({error: "No such tweet"});
};

// De 'producció' a 'available'
exports.removeImage = function(req, res){
  if(!req.params.link) return res.send({error: "No link"});

  for(var i = 0; i < images.length; i++) {
    if(images[i].link == req.params.link) {

      availableImages.unshift(images[i]);
      if(availableImages.length > 80) availableImages.splice(80);
      
      Instagrams.remove({link: images[i].link}, function(err){ if(err) console.log(err); });
      // DB
      images.splice(i, 1);

      return res.send({ availableImages: availableImages, availableTweets: availableTweets, prodImages : images, prodTweets: tweets});
    }
  }
  res.send({error: "No such image"});
};


// API CALLS
exports.getImages = function(req, res){
  res.send(images || []);
};

exports.getTweets = function(req, res){
  res.send(tweets || []);
};

exports.fetchCurrentContent = function(req, res){
  res.send({
    availableImages: availableImages,
    availableTweets: availableTweets,
    prodImages : images,
    prodTweets: tweets
  });
};

// INSTAGRAM AUTH TOKEN
exports.setAccountAccessTokenFromCode = function(req, res){
  var Instagram = require('instagram-node-lib');
  Instagram.set('client_id', config.INSTAGRAM_CLIENT_ID);
  Instagram.set('client_secret', config.INSTAGRAM_CLIENT_SECRET);
  Instagram.set('redirect_uri', config.INSTAGRAM_CALLBACK_URL)

  Instagram.oauth.ask_for_access_token({
    request: req,
    response: res,
    // redirect: 'http://your.redirect/url', // optional
    complete: function(params, response){

      if(!params) return res.send({error: "Unable to reach Instagram"});
      if(!params.access_token) return res.send({error: "Unable to authenticate with Instagram"});

      // params['access_token']
      // params['user']
      console.log(params);
    },
    error: function(errorMessage, errorObject, caller, response){
      // errorMessage is the raised error message
      // errorObject is either the object that caused the issue, or the nearest neighbor
      // caller is the method in which the error occurred
      // res.writeHead(406, {'Content-Type': 'text/plain'});
      // or some other response ended with
      res.end({error: errorMessage});
    }
  });
  return null;
};

/* DO NOT REMOVE THIS FUNCTION */

// API ROUTE LIST
exports.routes = {
  get: {
    '/api/images': [ exports.getImages ],
    '/api/tweets': [ exports.getTweets ],
    '/callback': [ exports.setAccountAccessTokenFromCode ],
    '/admin/api/available': [ exports.fetchCurrentContent ]
  },
  post: {
    '/admin/api/twitter': [ exports.promoteTweet ],
    '/admin/api/instagram': [ exports.promoteImage ]
  },
  put: {
  },
  'delete': {
    '/admin/api/twitter/:id': [ exports.removeTweet ],
    '/admin/api/instagram/:link': [ exports.removeImage ]
  }
};

console.log((new Date()).toJSON() + " | Enabling API routes (server.api.js)");
