var async = require('async');
module.exports = function(client){
  var doRequest = require('../util/doRequest')(client),
  conveniences,
  crudl = {
    // We're the only one calling this function, so relatively safe in our params
    list : function(listId, cb){
      var host = client.BASE_LIST_URL + "(guid'" + listId + "')" + "/Items";
      return doRequest(host, function(err, items){
        if (err){
          return cb(err);
        }
        items = conveniences('ListItems', items, listId);
        return cb(null, items);
      });
    },
    read : function(listId, itemId, cb){
      if (!listId || !itemId){
        return cb('Error reading - unspecified listId or itemId');
      }
      
      var host = client.BASE_LIST_URL + "(guid'" + listId + "')" + "/Items(" + itemId + ")",
      fileHost = host + '/File';
      
      async.parallel({
        item : async.apply(doRequest, host),
        file : async.apply(doRequest, fileHost)
      }, function(err, response){
        if (err){
          return cb(err);
        }
        var item = response.item;
        item.File = response.File;
        
        item = conveniences('ListItem', item, listId);
        return cb(null, item);
      });
    }
  };
  conveniences = require('../util/conveniences')(crudl);
  return crudl;
};
