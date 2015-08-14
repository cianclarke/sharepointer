var assert = require('assert'),
_ = require('underscore');

exports.it_should_login_and_retrieve_lists = function(done){
  var sharepoint = require('../../sharepoint.js')({
    username : process.env.SP_USERNAME,
    password : process.env.SP_PASSWORD,
    type : process.env.SP_AUTH_TYPE,
    url : process.env.SP_HOST,
    strictSSL : false
  });
  sharepoint.login(function(err){
    assert.ok(!err, 'Error on login: ' + err);
    sharepoint.lists.list(function(err, listRes){
      assert.ok(!err, 'Error on listing lists: ' + err);
      var one = _.find(listRes, function(aListItem){
        return aListItem.ItemCount && aListItem.ItemCount > 0;
      });
      assert.ok(one, 'Error find list result: ' + listRes);
      one.read(function(err, singleResult){
        if (err){
          return console.error(err);
        }
        assert.ok(singleResult, 'Error finding response from read result: ' + singleResult);
        var singleItem = singleResult.Items[0];
        if (!singleItem){
          console.error('Error - no items in list to test item.read()');
          return done();
        }
        singleItem.read(function(err, singleItemReadResult){
          console.log(err);
          assert.ok(!err, 'Error reading item in list: ' + err);
          assert.ok(singleItemReadResult, 'No singleItemReadResult found');
          console.log('got single item')
          console.log(singleItemReadResult);
          return done();
        });
      });
    });
  });  
};
