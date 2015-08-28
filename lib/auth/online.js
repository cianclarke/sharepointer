var _ = require('underscore'),
request = require('request'),
underscoreDeepExtend = require('underscore-deep-extend'),
async = require('async'),
dotty = require('dotty'),
fs = require('fs'),
parser = require('xml2json'),
saml = fs.readFileSync(__dirname + '/saml.xml').toString();

_.mixin({
  deepExtend: underscoreDeepExtend(_)
});

module.exports = function(client, httpOpts, cb) {
  
  waterfall = [];
  
  // If we're already auth'd, continue as normal with our valid tokens
  if (!client.FedAuth || !client.rtFa){
    waterfall.push(function(waterfallCb){
      var samlBody = _.clone(saml);
      samlBody = samlBody.replace('{username}', client.auth.username);
      samlBody = samlBody.replace('{password}', client.auth.password);
      samlBody = samlBody.replace('{url}', client.url);
      return waterfallCb(null, samlBody);
    });
    
    // Login with SPOnline using SAML
    waterfall.push(function(samlBody, waterfallCb){
      return request({
        method: 'post',
        body : samlBody,
        headers : {},
        url : 'https://login.microsoftonline.com/extSTS.srf'
      }, function(error, response, body){
        if (error){
          return waterfallCb(error);
        }
        if (response.statusCode !== 200){
          return waterfallCb('Unexpected status code ' + response.statusCode);
        }
        try{
          body = parser.toJson(body, { object : true });  
        }catch(err){
          return waterfallCb('Error parsing XML: ' + err.toString());
        }
        var samlError = dotty.get(body, "S:Envelope.S:Body.S:Fault"),
        token = dotty.get(body, "S:Envelope.S:Body.wst:RequestSecurityTokenResponse.wst:RequestedSecurityToken.wsse:BinarySecurityToken.$t");
        if (samlError){
          return waterfallCb('Error logging in - SAML fault detected.');
        }
        if (!token){
          return waterfallCb('No token found in response body');
        }
        return waterfallCb(null, token);
      });
    });
    
    // Exchange the SAML token for a cookie we can auth future SP requests with
    waterfall.push(function(token, waterfallCb){
      var requestOptions = {
        method: 'post',
        headers : {
          'User-Agent': 'fixIISPlease'
        },
        body : token,
        url : client.url + '/_forms/default.aspx?wa=wsignin1.0',
        // NB - SharePoint and IIS are a real PoS. See: https://github.com/joyent/node/issues/5119
        secureOptions: require('constants').SSL_OP_NO_TLSv1_2,
        strictSSL : false,
        followRedirect: false
      };
      
      request.post(requestOptions, function(err, response){
        if (err){
          return waterfallCb(err);
        }
        if (response.statusCode.toString()[0] !== '3'){
          return waterfallCb('Received unexpected status code from SP token exchange: ' + response.statusCode);
        }
        var cookies = response.headers && response.headers['set-cookie'];
        var parsedCookies = {};
        _.each(cookies, function(c){
          // split on first occurance of the = char
          c = c.split(/=(.+)?/);
          if (c.length < 2){
            return;
          }
          parsedCookies[c[0]] = c[1];
        }); 
        if (!cookies || !cookies.length || !parsedCookies.FedAuth || !parsedCookies.rtFa){
          return cb('Could not find auth cookies in sharepoint response');
        }
        client.FedAuth = parsedCookies.FedAuth;
        client.rtFa = parsedCookies.rtFa;
        return waterfallCb(null);
      });
    });
  }
  
  waterfall.push(function(waterfallCb){
    var requestOpts = _.deepExtend({}, httpOpts, client.baseHTTPOptions, {
      headers: {
        'Cookie': 'FedAuth=' + client.FedAuth + '; rtFa=' + client.rtFa,
        'Accept' : 'application/json; odata=verbose',
        'Content-Type' : 'application/json; odata=verbose'
      },
      // NB - SharePoint and IIS are a real PoS. See: https://github.com/joyent/node/issues/5119
      secureOptions: require('constants').SSL_OP_NO_TLSv1_2,
      strictSSL : false,
      json : httpOpts.json || true
    }, httpOpts);
    return request(requestOpts, function(error, response, body){
      if (error){
        return waterfallCb(error);
      }
      return waterfallCb(error, response, body);
    });
  });
  
  return async.waterfall(waterfall, cb);
  
};
