var request = require('request'),
_ = require('underscore');

module.exports = function(client, httpOpts, cb){
  httpOpts = _.extend({}, client.baseHTTPOptions, {
    auth : {
      username: client.auth.username,
      password: client.auth.password,
      sendImmediately: true
    },
    strictSSL : false,
    json : httpOpts.json || true
  }, httpOpts);
  return request(httpOpts, cb);
};
