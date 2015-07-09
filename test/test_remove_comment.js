var assert = require('assert');
var fs = require('fs');
var path = require('path')

var removeComments = require( '../lib/removeComment' );

describe('removeComment', function () {

  it('equals', function () {
    var resulut = 'var a = 1, b = 2;';
    var code = fs.readFileSync( path.join(__dirname, './data_remove_comment_1.js'), {encoding: 'utf-8'} );
    code = removeComments( code ).trim();

    assert.equal(resulut, code);
  })
});
