var async = require('async'),
_ = require('underscore');

module.exports = function(client){
  var doRequest = require('../util/doRequest')(client),
  urlBuilder = require('../util/urlBuilderTools'),
  conveniences,
  crudl = {
    // We're the only one calling this function, so relatively safe in our params
    list : function(listId, cb){
      var host = client.BASE_LIST_URL + "(guid'" + listId + "')" + "/Items";

      //Append fieldValuesAsText, filterFields and / or selectFields to host
      host = urlBuilder.augmentURL(host, client.fieldValuesAsText, client.filterFields, client.selectFields);

      console.log('list Items URL ' + host);
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

      //Append fieldValuesAsText, filterFields and / or selectFields to host
      host = urlBuilder.augmentURL(host, client.fieldValuesAsText, client.filterFields, client.selectFields);
      console.log('read Items URL ' + host);

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
        item.url = host;
        return cb(null, item);
      });
    },
    create : function(listId, listItem, cb){
      if (!listId || !listItem){
        return cb('No list or listItem specifided');
      }

      var host = client.BASE_LIST_URL + "(guid'" + listId + "')" + "/Items";
      listItem = _.extend({
        "__metadata" : {
          "type" : "SP.List"
        }
      }, listItem);
      return doRequest({
        url : host,
        method : 'POST',
        json : listItem,
        headers: {
          'X-RequestDigest': client.baseContext,
          'IF-MATCH': '*',
          'X-HTTP-Method': 'POST'
        }
      }, function(err, createResult){
        if (err){
          return cb(err);
        }
        createResult = conveniences('ListItem', createResult, listId);
        return cb(null, createResult);
      });
    },
    del : function(listId, itemId, cb){
      if (!listId || !itemId){
        return cb('Error deleting - unspecified listId or itemId');
      }

      var host = client.BASE_LIST_URL + "(guid'" + listId + "')" + "/Items(" + itemId + ")";
      return doRequest({
        url : host,
        method : 'POST',
        headers: {
          'X-RequestDigest': client.baseContext,
          'IF-MATCH': '*',
          'X-HTTP-Method': 'DELETE'
        }
      }, function(err, createResult){
        if (err){
          return cb(err);
        }
        return cb(null, createResult);
      });
    }
  };
  crudl['delete'] = crudl.del;
  conveniences = require('../util/conveniences')(crudl);
  return crudl;
};
