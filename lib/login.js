var auths = {
  'basic': require('./auth/basic'),
  'ntlm': require('./auth/ntlm'),
  'online': require('./auth/online')
},
makeSharepointResponsesLessAwful = require('./util/odata');

module.exports = function(client) {
  var type = client.auth.type;
  if (!type || !auths.hasOwnProperty(type)) {
    return cb('Unsupported auth type: ' + type);
  }
  client.httpClient = auths[type];
  return function(cb) {
    var context = (!client.siteContext || client.siteContext === 'web') ? '' : '/' + client.siteContext,
    contextUrl = client.url + context + '/_api/contextinfo';
    var httpOpts = {
      url: contextUrl,
      method: 'post'
    };

    // Call the implementing HTTP client, then handle the response generically
    return auths[type](client, httpOpts, function(err, response, body) {
      if (err) {
        return cb(err);
      }
      if (response.statusCode.toString()[0] !== '2') {
        return cb('Unexpected status code ' + response.statusCode);
      }
      body = makeSharepointResponsesLessAwful(body);

      if (!body.GetContextWebInformation || !body.GetContextWebInformation.FormDigestValue) {
        return cb({
          message: 'Failed to load default context from response body',
          body: body
        });
      }
      client.baseContext = body.GetContextWebInformation.FormDigestValue;
      return cb(null, response, body);
    });
  };
};
