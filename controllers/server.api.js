var config = require('./config.js');


// API CALLS

exports.getValue = function(req, res){
  res.send([1, 2, 3]);
};



/* DO NOT REMOVE THIS FUNCTION */

// API ROUTE LIST
exports.routes = {
  get: {
    '/api/value': [ exports.getValue ],
  },
  post: {
  },
  put: {
  },
  'delete': {
  }
};

console.log((new Date()).toJSON() + " | Enabling API routes (server.api.js)");
