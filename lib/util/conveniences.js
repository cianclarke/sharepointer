var _ = require('underscore'),
async = require('async');
module.exports = function(CRUDL){
  var conveniences = {
    List : function(list){
      list.read = async.apply(CRUDL.read, list.Id);
      list.delete = async.apply(CRUDL.del, list.Id);
      list.update = function(updatedObject, cb){
        return CRUDL.update(list.Id, updatedObject, cb);
      };
      return list;
    },
    ListItem : function(listItem, parentId){
      listItem.read = async.apply(CRUDL.read, parentId, listItem.Id);
      return listItem;
    },
    ListItems : function(listItems, parentId){
      return _.map(listItems, function(item){
        return conveniences.ListItem(item, parentId);
      });
    },
    Lists : function(lists){
     return _.map(lists, conveniences.List);
    },
    Items : function(items){
      return items;
    },
    Fields : function(fields){
      return fields;
    }
  };
  return function(type, objects, parentId){
    if (!conveniences.hasOwnProperty(type)){
      return objects;
    }
    
    return conveniences[type](objects, parentId);
  }
};
