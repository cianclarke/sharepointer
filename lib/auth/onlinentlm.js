var _ = require('underscore'),
request = require('request'),
underscoreDeepExtend = require('underscore-deep-extend'),
async = require('async'),
constants = require('../constants');
_.mixin({
  deepExtend: underscoreDeepExtend(_)
});

module.exports = function(client, httpOpts, cb) {
  var waterfall = [],
  jar = request.jar();
    waterfall.push(function(waterfallCb){
      var requestOpts = _.deepExtend({}, httpOpts, {
        method : 'get',
        jar : jar,
        proxy : 'http://127.0.0.1:8080',
        strictSSL : false,
        url : 'https://login.microsoftonline.com/login.srf',
        timeout: constants.SP_ONLINE_TIMEOUT
      });
      request(requestOpts, function(err, response, body){
        if (err){
          console.log(err);
          return waterfallCb(err);
        }
        //console.log(body);
        // This is fragile, but effecient. Moving to dom parser may be a better approach long term
        var ctx = body.match(/"ctx" value="(.+)"/);
        if (ctx.length !== 2){
          return waterfallCb('No context token found');
        }
        ctx = ctx[1];
        
        var lc = body.match(/"ReqLC" content="([0-9A-Za-z]+)"/);
        if (lc.length !== 2){
          return waterfallCb('No context token found');
        }
        lc = lc[1];
        
        return waterfallCb(null, ctx, lc);
      });
    });
    
    // Login with SPOnline using SAML
    waterfall.push(function(contextToken, lc, waterfallCb){
      var requestOpts = _.deepExtend({}, httpOpts, {
        method : 'get',
        jar : jar,
        proxy : 'http://127.0.0.1:8080',
        strictSSL : false,
        qs : {
          checkForMicrosoftAccount : false,
          'api-version' : '2.1',
          stsRequest : contextToken,
          lc : lc
        },
        url : 'https://login.microsoftonline.com/common/userrealm/',
        json : true,
        timeout: constants.SP_ONLINE_TIMEOUT
      });
      return request(requestOpts, function(error, response, body){
        if (error){
          return waterfallCb(error);
        }
        if (response.statusCode !== 200){
          return waterfallCb('Unexpected status code ' + response.statusCode);
        }
        var authUrl = body.AuthURL + '&lc=' + lc;
        client.auth.workstation = 'FeedHenry-mBaaS-Service';
        console.log('gotAuthUrl');
        console.log(authUrl);
        return waterfallCb(null, authUrl);
      });
    });
    
    // Exchange the SAML token for a cookie we can auth future SP requests with
    waterfall.push(function(authUrl, waterfallCb){
      var requestOptions = _.deepExtend({}, constants.SP_ONLINE_SECURITY_OPTIONS, client.baseHTTPOptions, httpOpts, {
        url : authUrl,
        proxy : 'http://127.0.0.1:8080',
        strictSSL : false,
        followAllRedirects: true,
        timeout: constants.SP_ONLINE_TIMEOUT,
        jar : jar
      });
      
      request.get(requestOptions, function(err, response, body){
        if (err){
          return waterfallCb(err);
        }
        var ntlmUrl = response.request.uri.href;
        var ntlm = require('./ntlm');
        console.log('ntlming');
        console.log(ntlmUrl);
        console.log(jar);
        ntlm(client, { url : ntlmUrl, jar : jar }, function(err, response, body){
          if (err){
            console.log(err);
          }
          console.log(response.statusCode);
          console.log(response.headers);
          console.log(body);
        });
      });
    });
  
  
  return async.waterfall(waterfall, cb);
};
