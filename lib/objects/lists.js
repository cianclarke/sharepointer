var _ = require('underscore'),
async = require('async');

module.exports = function(client){
  var verbosityFilter = require('../util/verbosityFilter')(client),
  doRequest = require('../util/doRequest')(client);
  
  function readOrList(params, cb){
    var isReadOperation = true,
    guid, name, host;
    if (_.isFunction(params)){
      cb = params;
      params = undefined;
      isReadOperation = false;
    }else{
      guid = params.guid || params.id || params.Guid || params.Id;
      name = params.name || params.title || params.Name || params.Title;
    }

    host = '/_api/web/lists';
    if (_.isString(params)){
      guid = params;
    }
    
    // Spot the pattern! Yep, you got it - there isn't really one. Thanks, MSFT. 
    if (guid){
      // I have no idea why GUID follows some semblence of oData protocol..
      host +="(guid'" + guid + "')";
    }else if (name){
      // by by name just ignores it. WTF is filter doing where the resource name should be. Bro, you don't even REST. 
      host += "/getbytitle('" + name + "')";
    }
    
    if (!isReadOperation){
      return doRequest(host, function(err, list){
        if (err){
          return cb(err);
        }
        return cb(null, verbosityFilter(list, 'Lists'));
      });  
    }
    
    
    return async.parallel({
      List : async.apply(doRequest, host),
      Fields : async.apply(doRequest, host + '/Fields'),
      Items : async.apply(doRequest, host + '/Items')
    }, function(err, combinedReadResult){
      if (err){
        return cb(err);
      }
      var list = verbosityFilter(combinedReadResult.List, 'List');
      list.Fields = verbosityFilter(combinedReadResult.Fields, 'Fields');
      list.Items = verbosityFilter(combinedReadResult.Items, 'Items');
      return cb(null, list);
    });
  }
  var r = {
    create : undefined,
    read : readOrList,
    update : undefined,
    list : readOrList,
    del : undefined
  };
  r['delete'] = undefined;
  return r;
};
