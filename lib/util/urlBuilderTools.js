/*
 This function is used to add parameters to a URL used to call Sharepoint.
 -/FieldValuesAsText will make all fields for an item show as a text value instead of an identifier.
 -filter fields are used to limit items returned based on value of one or more fields
 -select fields are used to limit the fields returned
 */
exports.augmentURL = function(url, fieldValuesAsText, filterFields, selectFields) {
  var finalURL = url.trim(),
  filter = '$filter',
  filterField = '',
  filterString = '',
  select = '$select=';

  //Show all values as text
  if(fieldValuesAsText) {
    finalURL += '/FieldValuesAsText';
  }

  //build filter string - used to get items with a specific value for a field
  if(filterFields !== null && filterFields.hasOwnProperty('length')) {
    if(filterFields.length === 1) {
      try {
        filterField = JSON.parse(filterFields[0]);
      }
      catch(e) {
        console.log('Unable to parse filterFields');
      }
      filterString = filterField['field'] + '%20eq%20' + "'" + filterField['value'] + "'";
    }
    else {
      for(i=0;i<filterFields.length;i++) {
        filterField = JSON.parse(filterFields[i]);
        if(i === 0) {
          filterString = '(' + filterField['field'].trim() + '%20eq%20' + "'" + filterField['value'].trim() + "')";
        }
        else {
          filterString += '%20and%20(' + filterField['field'].trim() + '%20eq%20' + "'" + filterField['value'].trim() + "')";
        }
      }
    }
    filter += filterString;
  }

  //build select string - used to tell Sharepoint which fields to return in response to REST call
  if(selectFields !== null) {
    selectFields.forEach(function(fields) {
      try {
       select += fields.toString().trim() + ',';
     }
     catch(e) {
       console.log('Unable to parse selectFields.');
     }
    });
    select = select.slice(0, -1);
  }

  //Append filter and / or select query parameters to finalURL
  if(filter.length > 0) {
    finalURL += '?' + filter;
    if(select.length > 0) {
      finalURL += '&' + select;
    }
  }
  else if(select.length > 0) {
    finalURL += '?' + select;
  }

  return finalURL;
};
