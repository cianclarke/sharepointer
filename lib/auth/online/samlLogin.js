/*
 Performs a SAML login request with a SOAP body passed by samlBody.js
 */
var constants = require('../../constants.js'),
request = require('request'),
_ = require('underscore'),
underscoreDeepExtend = require('underscore-deep-extend');
_.mixin({
  deepExtend: underscoreDeepExtend(_)
});


module.exports = function(client, httpOpts, authUrl, samlRequestBody, waterfallCb){
  var requestOpts = _.deepExtend({}, httpOpts, client.baseHTTPOptions, {
    method: 'post',
    body : samlRequestBody,
    headers : {
      'content-type' : 'application/soap+xml; charset=utf-8',
      'accept' : '*'
    },
    secureOptions: require('constants').SSL_OP_NO_TLSv1_2,
    url : authUrl,
    timeout: constants.SP_ONLINE_TIMEOUT
  });
  return request(requestOpts, function(error, response, samlResponseBody){
    if (error){
      return waterfallCb(error);
    }
    if (response.statusCode !== 200){
      return waterfallCb('Unexpected status code from SamlLogin at ' + authUrl + ' : ' + response.statusCode);
    }
    if (!samlResponseBody){
      return waterfallCb('No response body from SAML request');
    }
    
    return waterfallCb(null, client, httpOpts, samlResponseBody);
  });
};
