
var fs = require('fs');
var test_file = "./test/fixtures/samlResponse.xml";
var underTest = require('../../lib/auth/online/samlResponse');
var assert = require('assert');
module.exports.test_saml_parse_response_ok  = function (finish){
  var xml = fs.readFileSync(test_file);
  underTest({},{},xml,function (err, ok, opts, token){
    assert.ok(! err, "did not expect an error from saml response");
    assert.equal("test" ,token, "expected the token to match " + token);
    finish();
  });
};


exports.test_saml_parse_response_error  = function (finish){
  var badXml = "<<>fdfsdfsdf<><<><??><<><>!<>!<!<>!.";

  underTest({},{},badXml,function (err, ok, opts, token){
     assert.ok(err, "expected an error parsing bad xml");
    finish();
  });
};
