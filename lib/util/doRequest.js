var makeSharepointResponsesLessAwful = require('./odata');
module.exports = function(client){
  var verbosityFilter = require('./verbosityFilter')(client);
  return function doRequest(opts, cb){
    if (typeof opts === 'string'){
      opts = { url : opts, method : 'get' };
    }
    opts.url = client.url + opts.url;
    opts.method = opts.method || 'get';
    client.httpClient(client, opts, function(err, response, body){
      if (err){
        return cb(err);
      }
      if (response.statusCode.toString()[0] !== '2'){
        var msg = 'Invalid status code received: ' + response.statusCode;
        if (body && body.error && body.error.message){
          msg = body.error.message;
        }
        return cb({message : msg, body : body, statusCode : response.statusCode});
      }
      
      body = makeSharepointResponsesLessAwful(body);
      body = verbosityFilter(body, opts.url);
      
      //TODO: Apply conveniences Here
      return cb(null, body);
    });
  };
};
