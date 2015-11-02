/*
 This function is used to add parameters to a URL used to call Sharepoint.
 -/FieldValuesAsText will make all fields for an item show as a text value instead of an identifier.
 -filter fields are used to limit items returned based on value of one or more fields
 -select fields are used to limit the fields returned
 */
exports.augmentURL = function(url, fieldValuesAsText, filterFields, selectFields) {
  var finalURL = trim(url),
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
          filterString = '(' + trim(filterField['field']) + '%20eq%20' + "'" + trim(filterField['value']) + "')";
        }
        else {
          filterString += '%20and%20(' + trim(filterField['field']) + '%20eq%20' + "'" + trim(filterField['value']) + "')";
        }
      }
    }
    filter += filterString;
  }

  //build select string - used to tell Sharepoint which fields to return in response to REST call
  if(selectFields !== null) {
    selectFields.forEach(function(fields) {
      try {
       select += trim(fields.toString()) + ',';
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
