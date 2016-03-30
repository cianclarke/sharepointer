module.exports = function(params){
  if (!params.username || !params.password || !params.url){
    throw new Error('SharePoint client needs a username, password and instance URL');
  }
  this.url = params.url;
  this.federatedAuthUrl = params.federatedAuthUrl;
  this.auth = {};
  this.siteContext = params.context || 'web';
  this.auth.username = params.username;
  this.auth.password = params.password;
  this.auth.workstation = params.workstation || '';
  this.auth.domain = params.domain || '';
  this.auth.type = params.type || 'basic';
  this.auth.custom = params.authenticator;
  this.verbose = (typeof params.verbose === 'boolean') ? params.verbose : false;
  this.fieldValuesAsText = (typeof params.fieldValuesAsText === 'boolean') ? params.fieldValuesAsText : false;
  this.filterFields = params.filterFields || null;  //an array of objects ["{\"field\": \"one\", \"value\": \"1\"}", "{\"field\": \"two\", \"value\": \"2\"}"]
  this.selectFields = params.selectFields || null;  //array ["one", "two"]
  this.expandFields = params.expandFields || null; //array ["one", "two"]

  // We later set up http requests with this options object, either basic auth (goes in 'auth'),
  // or NTLM (goes in an Authorization header)
  this.baseHTTPOptions = {
    headers : {
      'Accept' : 'application/json; odata=verbose',
      'Content-Type' : 'application/json; odata=verbose'
    },
    strictSSL: (typeof params.strictSSL === 'boolean') ? params.strictSSL : true,
    proxy : params.proxy || undefined
  };
  this.BASE_LIST_URL = '/_api/web/lists';
  if (this.siteContext && this.siteContext !== 'web'){
    this.BASE_LIST_URL = '/' + this.siteContext + this.BASE_LIST_URL;
  }

  return {
    login : require('./login')(this),
    lists : require('./objects/lists')(this),
    listItems : require('./objects/listItems')(this)
  };
};
