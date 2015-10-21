/*
 Performs a SAML login request with a SOAP body passed by samlBody.js
 */
var constants = require('../../constants.js'),
request = require('request');

module.exports = function(client, httpOpts, authUrl, samlRequestBody, waterfallCb){
  return request({
    method: 'post',
    body : samlRequestBody,
    headers : {
      'content-type' : 'application/soap+xml; charset=utf-8'
    },
    secureOptions: require('constants').SSL_OP_NO_TLSv1_2,
    url : authUrl,
    timeout: constants.SP_ONLINE_TIMEOUT
  }, function(error, response, samlResponseBody){
    if (error){
      return waterfallCb(error);
    }
    if (response.statusCode !== 200){
      return waterfallCb('Unexpected status code from SamlLogin: ' + response.statusCode);
    }
    if (!samlResponseBody){
      return waterfallCb('No response body from SAML request');
    }
    
    return waterfallCb(null, client, httpOpts, samlResponseBody);
  });
};
