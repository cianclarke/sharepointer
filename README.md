Node.js Sharepoint client which is  

* Not written in CofeeScript
* Has test coverage
* Supports multiple authentication schemas - currently:
  * NTLM
  * Basic
* Will accept pull requests - 'cause I'm nice like that

## A Sharepoint Primer
Skip this if you don't know anything about SharePoint. Here's the basics I wanted to know about this product before I began integrating:


* Sharepoint is a number of products:
  * SharePoint 2013 - the on premise version of Sharepoint which I've seen most often. 
  * Sharepoint 365 - the online SharePoint product. 
* **Everything is a List** in SharePoint. Document Library? A list. The tasks app? Just a list. Discussion Board? You got it, it's a list. Site Pages? List. Turns out, Sharepoint reuses the base type `List` for a lot of things. 
* 


## Usage Examples
    
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
      console.log("Logged in OK");
      sharepoint.lists.list(function(err, listRes){
        var one = listRes[0];
        console.log('got one');
        console.log(one.Id);
        sharepoint.lists.read(one.Id, function(err, singleResult){
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
    
    
## Methods

### Lists
As mentioned above, SharePoint is driven by lists. The base SharePoint API allows you to `CRUDL` lists, but the read operation doesn't return items[] or fields[] - this is a separate API operation. 
With Sharepointer, list read operations also retrieve all fields[] and items[] on the list for convenience.  

#### List
    
    sharepoint.lists.list(function(err, listRes){
      // listRes will be an array of lists [{ Id : '1a2b3c', ... }, { Id : '2b3c4d' }, { Id : '5d6e7f' }]
    });
    
#### Read
List Read can take a string as the first param (assumes list Id), or a params object specifying either a guid or title.  
Note that list read also returns fields[] and items[]. This is different to how the SharePoint API behaves, and is offered as a convenience. 
    
    // Get a list by ID - you can find this under the 'Id' preoprty in "lists" lists
    sharepoint.lists.read('someListGUID', function(err, listReadResult){
      // listReadResult will be an object { Id : 'someListGUID', Title : 'SomeListTitle', items : [{}, {}], fields : [{}, {}]  ... }
    });
    
    // Get a list by name
    sharepoint.lists.read({title : 'some list name' }, function(err, listReadResult){
      // listReadResult will be an object { Id : 'someListGUID', Title : 'some list name', ... }
    });
    
#### Create
Creating a result requires a title and a description. 

    sharepoint.lists.create({ title : 'My new list', description : 'Some list description' }, function(err, createRes){
      // createRes will be the newly created list as an object { Id : 'someListGUID', title : 'My new list', ...}
    });
    
### Update
Updating requires an ID and a title. Optionally, you can just specify all this in one object. 
    
    // Update with 2 params
    return sharepoint.lists.update('someListGuid', { Title : 'MyNewTitle' }, function(err, updateResult){
      // updateResult will be the object you passed in, but not the full list. To get the fully updated object, a subsequent read is needed. 
    });
    
    // update all in 1 param
    return sharepoint.lists.update({ Id : 'someListGuid', Title : 'MyNewTitle' }, function(err, updateResult){
    });
    
#### Delete
Delete requires a list Id. Deletion by title is not possible. 
    
    sharepoint.lists.del('someListId', function(err){
      // Err will indicate if somethign went wrong - there's no second param
    });
    
