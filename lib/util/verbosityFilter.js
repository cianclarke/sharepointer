/*
  The sharepoint API is very verbose. By default, let's return what "looks" useful, with the option to filter further. 
 */
var _ = require('underscore'), 
verbosityFilters = {
   "DefaultPick" : ['Created', 'Description', 'Id', 'Title'],
   "DefaultOmit" : ['__metadata', 'FirstUniqueAncestorSecurableObject', 'RoleAssignments', 'AttachmentFiles', 'ContentType', 'FieldValuesAsHtml', 'FieldValuesAsText', 'FieldValuesForEdit', 'File', 'Folder', 'ParentList'],
   "Lists" : { type : 'pick', fields : ['ImageUrl', 'LastItemDeletedDate', 'LastItemModifiedDate', 'ListItemEntityTypeFullName'] },
   "List" : { type : 'pick', fields : ['DocumentTemplateUrl', 'EntityTypeName', 'ImageUrl', 'LastItemDeletedDate', 'LastItemModifiedDate', 'ListItemEntityTypeFullName', 'TemplateFeatureId'] },
   "Fields" : { type : 'omit', fields : ['SchemaXml'] },
   "Items" : { type : 'omit', fields : [] }
 };

 
module.exports = function(client){
 return function filterVerboseFields(item, type){
   if (client.verbose === true){
     return item;
   }
   var fieldsToFilter = verbosityFilters[type].fields,
   fieldFilterType = verbosityFilters[type].type; // pick or omit
   
   if (fieldFilterType === 'pick'){
     fieldsToFilter = fieldsToFilter.concat(verbosityFilters.DefaultPick);
   }else{
     fieldsToFilter = fieldsToFilter.concat(verbosityFilters.DefaultOmit);
   }
   
   if (_.isArray(item)){
     return _.map(item, function(o){
       return _[fieldFilterType](o, fieldsToFilter);
     });
   }
   return _[fieldFilterType](item, fieldsToFilter);
 };
};
