var _ = require('underscore'),
underscoreDeepExtend = require('underscore-deep-extend'),
async = require('async'),
getSamlBody = require('./online/samlBody'),
samlLogin = require('./online/samlLogin'),
samlResponse = require('./online/samlResponse'),
samlAssertionResponse = require('./online/samlAssertionResponse'),
samlTokenToCookie = require('./online/samlTokenToCookie'),
authenticatedRequestClient = require('./online/authenticatedRequestClient'),
assert=require('assert');

_.mixin({
  deepExtend: underscoreDeepExtend(_)
});

module.exports = function(client, httpOpts, cb) {
  var waterfall = [];
  
  if (!client.FedAuth || !client.rtFa){
    assert.ok(client.federatedAuthUrl, "Federated Auth URL is required when using onlinesaml");
    waterfall.push(async.apply(getSamlBody, client, httpOpts, client.federatedAuthUrl, 'urn:federation:MicrosoftOnline', null));
    waterfall.push(samlLogin);
    waterfall.push(samlAssertionResponse);
    waterfall.push(getSamlBody);
    waterfall.push(samlLogin);
    waterfall.push(samlResponse);
    waterfall.push(samlTokenToCookie);
    waterfall.push(authenticatedRequestClient);
  }else{
    waterfall.push(async.apply(authenticatedRequestClient, client, httpOpts));
  }  
  return async.waterfall(waterfall, cb);
};
