var assert = require('assert');
var idToDelete;

var sharepoint = require('../../sharepoint.js')({
  username : process.env.SP_USERNAME,
  password : process.env.SP_PASSWORD,
  type : process.env.SP_AUTH_TYPE,
  url : process.env.SP_HOST,
  strictSSL : false
});

exports.it_should_create_and_delete_lists = function(done){

  sharepoint.login(function(err){
    sharepoint.lists.create({ title : 'mynewlisttester2' }, function(err, createRes){
      assert.ok(!err, 'Error on creating list: ' + err);
      assert.ok(createRes, 'No create result found: ' + createRes);
      idToDelete = createRes.Id;
      return sharepoint.lists.update(createRes.Id, { Title : 'MyNewTitle' }, function(err, updateResult){
        if (err){
          console.log('List update error');
          console.log(err);
        }
        assert.ok(!err, 'Error on updating list: ' + err);
        assert.ok(updateResult, 'No update result found: ' + updateResult);
        return done();
      });
    });
  });  
};


exports.after = function(done){
  if (!idToDelete){
    return done();
  }
  sharepoint.lists.del(idToDelete, function(err){
    if (err){
      console.log(err);
    }
    assert.ok(!err, 'Error deleting list: ' + err);
    console.log('List deleted ok');
    return done();
  });
}
