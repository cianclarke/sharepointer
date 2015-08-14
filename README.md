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

#### List

#### Read

#### Update
// TODO

#### Delete