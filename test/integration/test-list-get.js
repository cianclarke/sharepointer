var assert = require('assert');

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
      var one = listRes[0];
      assert.ok(one, 'Error find list result: ' + listRes);
      sharepoint.lists.read(one.Id, function(err, singleResult){
        if (err){
          return console.error(err);
        }
        assert.ok(singleResult, 'Error finding response from read result: ' + singleResult);
        console.log('Done read op');
        console.log(singleResult);
        return done();
      });
    });
  });  
};
