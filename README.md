[![Build Status](https://travis-ci.org/cianclarke/sharepointer.svg)](https://travis-ci.org/cianclarke/sharepointer)

Yet another Node.js Sharepoint client. This one:

* Has test coverage
* Isn't written in CofeeScript
* Supports multiple authentication schemas - currently:
  * NTLM
  * Basic
* Accepts pull requests :-)

# Usage Example
    
    var sharepoint = require('sharepoint')({
      username : 'someusername',
      password : 'somepassword',
      // Authentication type - current valid values: ntlm, basic
      type : 'ntlm',
      url : 'https://someSharepointHostname.com'
    });
    sharepoint.login(function(err){
      if (err){
        return console.error(err);
      }
      // Once logged in, we can list the "lists" within sharepoint
      sharepoint.lists.list(function(err, listRes){
        var aList = listRes[0];
        // We can pick a particular list, and read it. This also gives us the list's Items[] and Fields[]
        sharepoint.lists.read(aList.Id, function(err, listRead){
          console.log(singleResult);
        });
      });
    });
    
##Paramaters
When initialising Sharepoint, there are a number of optional params which can be specified at init. Here are their defaults & descriptions
    
    var sharepoint = require('sharepoint')({
      username : 'someusername',
      password : 'somepassword',
      // Authentication type - current valid values: ntlm, basic
      type : 'ntlm',
      url : 'https://someSharepointHostname.com',
      // All of the following params are optional:
      verbose : false, // Set to true to stop filtering responses, instead returning everything
      proxy : undefined, // set to string hostname of proxy if running through one
      strictSSL : true // set to false if connecting to SP instance with self-signed cert
    });
    
# A Sharepoint Primer
Skip this if you already know enough about SharePoint.  
Here's the basics I wanted to know about this product before I began integrating:


* Sharepoint is a number of products:
  * SharePoint 2013 - the on premise version of Sharepoint which I've seen most often. 
  * Sharepoint 365 - the online SharePoint product. 
* **Everything is a List** in SharePoint. Document Library? A list. The tasks app? Just a list. Discussion Board? You got it, it's a list. Site Pages? List. Turns out, Sharepoint reuses the base type `List` for a lot of things. 

    
    
# Methods

## Lists
As mentioned above, SharePoint is driven by lists. The base SharePoint API allows you to `CRUDL` lists, but the read operation doesn't return Items[] or Fields[] - this is a separate API operation. 
With Sharepointer, list read operations also retrieve all Fields[] and Items[] on the list for convenience.  

### Lists List
Confusing, I know. Bear with me. Lists all objects of type `list` in sharepoints (and remember, almost everything in Sharepoint is a list!).
    
    sharepoint.lists.list(function(err, listRes){
      // listRes will be an array of lists [{ Id : '1a2b3c', ... }, { Id : '2b3c4d' }, { Id : '5d6e7f' }]
    });
    
You can now use any of the following functions to operate upon lists. Note that each `lists` object in the array will also have a convenience function which operates on itself for read, update & delete. These are also documented below. 

### Lists Create
Creating a result requires a title and a description. 

    sharepoint.lists.create({ title : 'My new list', description : 'Some list description' }, function(err, createRes){
      // createRes will be the newly created list as an object { Id : 'someListGUID', title : 'My new list', ...}
    });
    
    
### Lists Read
List Read can take a string as the first param (assumes list Id), or a params object specifying either a guid or title.  
The list operation already tells us quite a bit about that list, but this read call also returns Fields[] and Items[]. This is different to how the SharePoint API behaves, and is offered as a convenience. 
    
    // Get a list by ID - you can find this under the 'Id' property.
    sharepoint.lists.read('someListGUID', function(err, listReadResult){
      // listReadResult will be an object { Id : 'someListGUID', Title : 'SomeListTitle', Items : [{}, {}], Fields : [{}, {}]  ... }
    });
    
    // Get a list by name
    sharepoint.lists.read({title : 'some list name' }, function(err, listReadResult){
      // listReadResult will be an object { Id : 'someListGUID', Title : 'some list name', ... }
    });
    
    // You can also call a read() operation from an object returned from the list operation for convenience like this
    sharepoint.lists.list(function(err, listRes){
      var aList = listRes[0];
      aList.read(function(err, aListReadResult){
        
      });
    });
    
## Lists Update
Updating requires an ID and a title. Optionally, you can just specify all this in one object. 
    
    // Update specifying the Id separately 
    return sharepoint.lists.update('someListGuid', { Title : 'MyNewTitle' }, function(err, updateResult){
      // updateResult will be the object you passed in, but not the full list. To get the fully updated object, a subsequent read is needed. 
    });
    
    // Updating specifying the Id in one param
    return sharepoint.lists.update({ Id : 'someListGuid', Title : 'MyNewTitle' }, function(err, updateResult){
    });
    
    // You can also call a update() operation from an object returned from the list operation for convenience like this
    sharepoint.lists.list(function(err, listRes){
      var aList = listRes[0];
      aList.update({Title : '' }, function(err){
        
      });
    });
    
### Lists Delete
Delete requires a list Id. Deletion by title is not possible. 
    
    sharepoint.lists.del('someListId', function(err){
      // Err will indicate if somethign went wrong - there's no second param
    });
    
    // You can also call a delete() operation from an object returned from the list operation for convenience like this
    sharepoint.lists.list(function(err, listRes){
      var aList = listRes[0];
      aList.update({Title : '' }, function(err){
        
      });
    });

##List Items
Lists in sharepoint have a collection of items. These are usually another API call away, but as discussed earlier, sharepointer retrieves these upon performing a read() call. 

###ListItems List
To retrieve the items contained within a list, 
    
	sharepoint.listItems.list('someListGUID', function(err, itemsUnderThisList){

    });
Of course, we can also just perform a list read: 
    
    sharepoint.listItems.read('someListGUID', function(err, listReadResult){
      // we now have the items under listReadResult.Items
    });
    
###ListItem Create
    
    //TODO
    
###ListItem Read
As part of reading a ListItem, we also retrieve it's File property, if any exists. This is helpful, because many lists include a file attachment (e.g. Document Libraries). If no file exists, this will simply be `undefined`. 
    
    sharepoint.listItems.read('someListGUID', 'someListItemId', function(err, singleListItem){

    });
    
Of course, we can also just call .read() on a listItem, after we read it's containing list. 
    
    sharepoint.lists.read('someListGUID', function(err, listReadResult){
      var anItemInThisList = listReadResult.Items[0];
      anItemInThisList.read(function(err, listItem){
        
      });
    });
