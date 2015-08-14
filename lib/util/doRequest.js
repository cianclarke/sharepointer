var makeSharepointResponsesLessAwful = require('./odata');
module.exports = function(client){
  return function doRequest(host, cb){
    client.httpClient(client, {
      url : client.url + host,
      method : 'get'
    }, function(err, response, body){
      if (err){
        return cb(err);
      }
      if (response.statusCode.toString()[0] !== '2'){
        return cb('');
      }
      
      body = makeSharepointResponsesLessAwful(body);
      
      return cb(null, body);
    });
  };
};
