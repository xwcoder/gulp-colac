'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var util = require('util');
var path = require('path');

module.exports = function (options) {

  var REG_HAS_DEFINE = /(?:^|\s+)define\s*\(/m;
  var REG_MATCH_USE = /((?:^|\s+)cola\.use\s*\(\s*\bfunction\b)/m;
  var REG_REQUIRE = /\brequire\(\s*['"](\S*)['"]\s*\)/g;

  var files = []; //调整文件顺序, cola.use排最后

  function removeComment ( code ) {
    return code.replace( /\/\*.*\*\//g, '' )
              .replace( /\/\/.*(?=[\n\t])/g, '')
              .replace( /^\s*\/\*[\s\S]*?\*\/\s*$/mg, '' );
  }

  function unique ( deps ) {
      var ret = [];
      var map = {};

      for ( var i = 0, len = deps.length; i < len; i++ ) {
          if ( !map[ deps[i] ] ) {
              map[ deps[i] ] = 1;
              ret.push( deps[i] );
          }
      }
      return ret;
  }

  function parseDeps ( code ) {

      code = removeComment( code );

      if ( code.indexOf( 'require' ) == '-1' ) {
          return [];
      }

      var deps = [], match;

      while ( match = REG_REQUIRE.exec( code ) ) {
          deps.push( match[ 1 ] );
      }

      return unique( deps );
  }

  function getModuleID ( file, options ) {
    var relativePath = path.relative( file.cwd, file.path );
    if ( options && options.relativePath ) {
      relativePath = path.relative( 'js', relativePath );
    }
    return path.join(path.dirname(relativePath), path.basename(relativePath, path.extname(relativePath)));
  }

	return through.obj(function (file, enc, cb) {

		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-colac', 'Streaming not supported'));
			return;
		}

		try {
      var contents = removeComment( file.contents.toString(enc) );

      var partial = '';
      var useBox = '';
      var bracketStack = [];

      var lastContent = contents;
      var char = '', index = 0, id, deps;


      if ( REG_MATCH_USE.test(contents) ) { //处理cola.use

        file._colause = 1;

        while ( lastContent && REG_MATCH_USE.test(lastContent) ) {

          partial += RegExp.leftContext;
          partial += RegExp.$1.replace('function', '');

          lastContent = RegExp.rightContext;

          bracketStack = ['('];
          useBox = ''
          index = 0;

          while ( char = lastContent[index++] ) {
            useBox += char;
            if ( char == '(' ) {
              bracketStack.push(char);
            } else if ( char == ')' ) {
              bracketStack.pop();
            }

            if ( !bracketStack.length ) {
              break;
            }
          }

          deps = parseDeps(useBox);

          partial += JSON.stringify(deps);
          partial += ', function';
          partial += useBox;

          lastContent = lastContent.slice(index);
        }

        partial += (lastContent || '');

        contents = partial;

      } else { //处理define
        if ( REG_HAS_DEFINE.test(contents) ) {
          //对于源码里自己写define的情况暂不做处理
          //TODO 以后考虑
        } else {
          deps = parseDeps(contents);
          id = getModuleID(file, options);
          if ( options.ns ) {
            contents = options.ns + '.define("' + id + '", ' + JSON.stringify( deps ) + ', function (require, exports, module) {'
              + '\n' + contents
              + '\n} );';
          } else {
            contents = 'define("' + id + '", ' + JSON.stringify( deps ) + ', function (require, exports, module) {'
              + '\n' + contents
              + '\n} );';
          }
        }
      }

			file.contents = new Buffer(contents.toString());
			//file.contents = new Buffer(file.contents.toString(), options);
      files.push(file);
			//this.push(file);
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-colac', err));
		}

		cb();
	}, function (cb) {

    files.sort(function (f1, f2) {
      if ( (f1._colause && f2._colause)
        || (!f1._colause && !f2._colause) ) {
          return 0;
      }
      if ( f1._colause ) {
        return 1;
      } else {
        return -1;
      }
    }).forEach(function (file) {
      this.push(file);
    }.bind(this));

    cb();
  });
};
