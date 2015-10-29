var async = require('async'),
_ = require('underscore');

module.exports = function(client){
  var doRequest = require('../util/doRequest')(client),
  conveniences,
  filter = '',
  select = '',
  crudl = {
    // We're the only one calling this function, so relatively safe in our params
    list : function(listId, cb){
      var host = client.BASE_LIST_URL + "(guid'" + listId + "')" + "/Items";

      //Show all values as text
      if(client.fieldValuesAsText) {
        host += '/FieldValuesAsText';
      }
      //build filter string
      if(client.filterFields !== null && client.filterFields.hasOwnProperty('length')) {
        try{
          client.filterFields = JSON.parse(client.filterFields);
        }
        catch(e) {
          console.log('Could not parse');
        }
        filter +='$filter=';
        var filterString = '';
        if(client.filterFields.length === 1) {
          //var ff = JSON.parse(client.filterFields[0]);
          filterString = client.filterFields[0]['field'] + '%20eq%20' + "'" + client.filterFields[0]['value'] + "'";
          //filterString = ff['field'] + '%20eq%20' + "'" + ff['value'] + "'";
        }
        else {
          for(i=0;i<client.filterFields.length;i++) {
            if(i === 0) {
              filterString = '(' + client.filterFields[0]['field'] + '%20eq%20' + "'" + client.filterFields[0]['value'] + "')";
            }
            else {
              filterString += '%20and%20(' + client.filterFields[0]['field'] + '%20eq%20' + "'" + client.filterFields[0]['value'] + "')";
            }
          }
        }
        filter += filterString;
      }
      //build select string
      if(client.selectFields !== null) {
        select += '$select=';
        client.selectFields.forEach(function(fields) {
           select += fields + ',';
        });
        select = select.slice(0, -1);
      }

      //Add filter and / or select query parameters to host variable
      if(filter.length > 0) {
        host += '?' + filter;
        if(select.length > 0) {
          host += '&' + select;
        }
      }
      else if(select.length > 0) {
        host += '?' + select;
      }

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

      //Show all values as text
      if(client.fieldValuesAsText) {
        host += '/FieldValuesAsText';
      }

      //build select string
      if(client.selectFields !== null) {
        select += '$select=';
        client.selectFields.forEach(function(fields) {
           select += fields + ',';
        });
        select = select.slice(0, -1);
      }

      if(select.length > 0) {
        host += '?' + select;
      }
      console.log('listItems URL ' + host);
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
