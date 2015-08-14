var request = require('request');

module.exports = function(client, httpOpts, cb){
  httpOpts = _.extend({}, client.baseHTTPOptions, {
    auth : {
      username: client.auth.username,
      password: client.auth.password,
      sendImmediately: true
    }
  }, httpOpts);
  return request(httpOpts, cb);
};
