/*jshint -W069 */
/*
 This function is used to add parameters to a URL used to call Sharepoint.
 -/FieldValuesAsText will make all fields for an item show as a text value instead of an identifier.
 -filter fields are used to limit items returned based on value of one or more fields
 -select fields are used to limit the fields returned
 -expand fields are used to "JOIN" a lookup list to the list currently being Read / Listed
 */
exports.augmentURL = function(url, fieldValuesAsText, filterFields, selectFields, expandFields) {
  var finalURL = url.trim(),
  filter = '',
  filterField = '',
  filterString = '',
  select = '';
  expand = '';

  //Show all values as text
  if(fieldValuesAsText) {
    finalURL += '/FieldValuesAsText';
  }

  //build filter string - used to get items with a specific value for a field
  if(filterFields !== null && filterFields.hasOwnProperty('length')) {
    filter = '$filter=';
    if(filterFields.length === 1) {
      try {
        filterField = JSON.parse(filterFields[0]);
      }
      catch(e) {
        console.log('Unable to parse filterFields, expecting {"field":"Field1", "value":"Value1"}');
      }
      filterString = filterField['field'] + '%20eq%20' + "'" + filterField['value'] + "'";
    }
    else {
      for(i=0;i<filterFields.length;i++) {
        try {
          filterField = JSON.parse(filterFields[i]);
        }
        catch(e) {
          console.log('Unable to parse filterFields, expecting {"field":"Field1", "value":"Value1"}');
        }
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
  if(selectFields && selectFields !== null && selectFields.constructor === Array) {
    select = '$select=';
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

  //build expand string - used to tell Sharepoint to provide detail on value
  if(expandFields && expandFields !== null && expandFields.constructor === Array) {
    expand = '$expand=';
    expandFields.forEach(function(fields) {
      try {
       expand += fields.toString().trim() + ',';
     }
     catch(e) {
       console.log('Unable to parse expandFields.');
     }
    });
    expand = expand.slice(0, -1);
  }

  //Append filter and / or select query parameters to finalURL
  if(filter.length > 0) {
    finalURL += '?' + filter;
    if(select.length > 0) {
      finalURL += '&' + select;
    }
    if(expand.length > 0) {
      finalURL += '&' + expand;
    }
  }
  else if(select.length > 0) {
    finalURL += '?' + select;
    if(expand.length > 0) {
      finalURL += '&' + expand;
    }
  }
  else if(expand.length > 0) {
      finalURL += '?' + expand;
  }

  return finalURL;
};
