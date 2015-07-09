var assert = require('assert');
var fs = require('fs');
var path = require('path');
var regs = require('../lib/regs.js');
var removeComment = require('../lib/removeComment');

describe('define reg', function () {
  var code1 = removeComment( fs.readFileSync( path.join( __dirname, './data_reg_define_1.js' ), {encoding: 'utf-8'} ) );
  var code2 = removeComment( fs.readFileSync( path.join( __dirname, './data_reg_define_2.js' ), {encoding: 'utf-8'} ) );
  var code3 = removeComment( fs.readFileSync( path.join( __dirname, './data_reg_define_3.js' ), {encoding: 'utf-8'} ) );

  it('has define', function () {
    assert.equal(true, regs.REG_HAS_DEFINE.test(code1) );
  } );

  it('has no define', function () {
    assert.equal(false, regs.REG_HAS_DEFINE.test(code2) );
  } );

  it('has no define', function () {
    assert.equal(false, regs.REG_HAS_DEFINE.test(code3) );
  } );
} );

describe('use reg', function () {

  var code1 = removeComment( fs.readFileSync( path.join( __dirname, './data_reg_use_1.js' ), {encoding: 'utf-8'} ) );
  var code2 = removeComment( fs.readFileSync( path.join( __dirname, './data_reg_use_2.js' ), {encoding: 'utf-8'} ) );
  var code3 = removeComment( fs.readFileSync( path.join( __dirname, './data_reg_use_3.js' ), {encoding: 'utf-8'} ) );

  it('has use', function () {
    assert(true, regs.REG_HAS_USE.test(code1));
  } );

  it('has no use', function () {
    assert.equal(false, regs.REG_HAS_USE.test(code2));
  } );

  it('has use', function () {
    assert.equal(true, regs.REG_HAS_USE.test(code3));
  } );

} );

describe('replace use', function () {

  var code1 = removeComment( fs.readFileSync( path.join( __dirname, './data_reg_use_replace_1.js' ), {encoding: 'utf-8'} ) );
  //var code2 = removeComment( fs.readFileSync( path.join( __dirname, './data_reg_use_2.js' ), {encoding: 'utf-8'} ) );
  //var code3 = removeComment( fs.readFileSync( path.join( __dirname, './data_reg_use_3.js' ), {encoding: 'utf-8'} ) );

  it('use in on line', function () {
    assert(true, regs.REG_REPLACE_USE.test(code1));
  } );
});
