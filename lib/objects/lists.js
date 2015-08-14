var _ = require('underscore'),
async = require('async');
const BASE_LIST_URL = '/_api/web/lists';

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

    host = BASE_LIST_URL;
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
  
  function create(params, cb){
    var title, description;
    title = params.title || params.Title;
    description = params.description || params.Description || '';
    if (!title){
      return cb('Create requests must specify a title!');
    }
    var listToCreate = {
      __metadata : {
        'type' : 'SP.List'
      },
      BaseTemplate : 100,
      Title : title,
      Description : description
    };
    return doRequest({
      json : listToCreate,
      method : 'POST',
      headers : {
        'X-RequestDigest' : client.baseContext
      },
      url : BASE_LIST_URL
    }, function(err, listCreateResult){
      if (err){
        return cb(err);
      }
      return cb(null, verbosityFilter(listCreateResult, 'List'));
    });
  }
  
  function del(params, cb){
    if (!params || _.isFunction(params)){
      return cb('Delete operations need an Id and callback');
    }
    
    var host = BASE_LIST_URL,
    guid;
    if (_.isString(params)){
      guid = params;
    }else{
      guid = params.guid || params.Guid || params.id || params.Id;  
    }
    if (!guid){
      return cb('Delete operations must specify a list GUID');
    }
    host +="(guid'" + guid + "')";
    return doRequest({
      // POST? But I thought we were deleting?
      method : 'POST',
      headers : {
        'X-RequestDigest' : client.baseContext,
        'IF-MATCH': '*',
        // Oh sharepoint you crack me up
        'X-HTTP-Method' : 'DELETE'
      },
      url : host
    }, function(err, listCreateResult){
      if (err){
        return cb(err);
      }
      return cb(null, verbosityFilter(listCreateResult, 'List'));
    });
    
  }
  
  function update(id, updated, cb){
    if (_.isFunction(updated)){
      cb = updated;
      updated = id;
      id = updated.Id || updated.guid || updated.Guid || updated.id;
      // Ensure our updated object has appropriate Id object set
      updated.Id = id;
    }
    
    if (!id || !_.isObject(updated) || arguments.length < 2){
      return cb('Update operations must at least specify an updated object and a callback');
    }
    var host = BASE_LIST_URL + "(guid'" + id + "')",
    listToUpdate = _.extend({
        "__metadata":{
           "type":"SP.List"
        },
        "AllowContentTypes":true,
        "BaseTemplate":100,
        "ContentTypesEnabled":false
    }, updated)
    
    
    return doRequest({
      json : listToUpdate,
      method : 'POST',
      headers : {
        'X-RequestDigest' : client.baseContext,
        'X-HTTP-Method' : 'MERGE',
        "IF-MATCH": "*"
      },
      url : host
    }, function(err, listUpdateResult){
      if (err){
        return cb(err);
      }
      return cb(null, listToUpdate);
    });  
  }
  
  var r = {
    create : create,
    read : readOrList,
    // The PUT API is undefined
    update : update,
    list : readOrList,
    del : del
  };
  r['delete'] = del;
  return r;
};
