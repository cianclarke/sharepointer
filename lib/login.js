var auths = {
  'basic' : require('./auth/basic'),
  'ntlm' : require('./auth/ntlm')
};

module.exports = function(client){
  return function(cb){
    var type = client.auth.type;
    if (!type || !auths.hasOwnProperty(type)){
      return cb('Unsupported auth type: ' + type);
    }
    client.httpClient = auths[type];
    
    var httpOpts = {
        url: client.url + '/_api/contextinfo',
        method : 'post'
    };
    
    // Call the implementing HTTP client, then handle the response generically
    return auths[type](client, httpOpts, function(err, response, body){
      if (err){
        return cb(err);
      }
      if (response.statusCode.toString()[0] !== '2'){
        return cb('Unexpected status code ' + response.statusCode);
      }
      
      return cb(null, response, body);
    });  
  };
};
