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

      //FieldValuesAsText is not supported here by Sharepoint, Append filterFields
      // and / or selectFields  and / or expandFields to host
      host = urlBuilder.augmentURL(host, false, client.filterFields, client.selectFields, client.expandFields);

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

      //Append fieldValuesAsText (filters are not supported by Sharepoint at the item level)
      // and / or selectFields  and / or expandFields to host
      host = urlBuilder.augmentURL(host, client.fieldValuesAsText, null, client.selectFields, client.expandFields);
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
    update : function(listId, listItem, cb){
      if (!listId || !listItem){
        return cb('No list or listItem specifided');
      }

      var host = client.BASE_LIST_URL + "(guid'" + listId + "')" + "/Items(" + listItem.itemId + ")";
      console.log('-----sharepointer-objects-listItems host: ' + host);

      //remove the itemId property as we shouldn't need it in the post data
      delete listItem['itemId'];
      return doRequest({
        url : host,
        method : 'POST',
        body : JSON.stringify(listItem),
        headers: {
          'X-RequestDigest': client.baseContext,
          'If-Match': '*',
          'X-HTTP-Method': 'MERGE'
        }
      }, function(err, updateResult){
        if (err){
          return cb(err);
        }
        updateResult = conveniences('ListItem', updateResult, listId);
        return cb(null, updateResult);
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
          'If-Match': '*',
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
