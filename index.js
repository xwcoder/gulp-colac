'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var util = require('util');
var path = require('path');

module.exports = function (options) {

  var REG_HAS_DEFINE = /(?:^|\s+)define\s*\(/m;
  var REG_HAS_USE = /(?:^|\s+)cola\.use\s*\(/mg;
  var REG_MATCH_USE = /((?:^|\s+)cola\.use\s*\(\s*\bfunction\b)/m;
  var REG_REQUIRE = /\brequire\(\s*['"](\S*)['"]\s*\)/g;

  var files = []; //调整文件顺序, cola.use排最后

  //function removeComment ( code ) {
  //  return code.replace( /\/\*.*\*\//g, '' )
  //            .replace( /\/\/.*(?=[\n\t])/g, '')
  //            .replace( /^\s*\/\*[\s\S]*?\*\/\s*$/mg, '' );
  //}

  function removeComments ( code ) {
      //return code.replace( /\/\*.*\*\//g, '' )
                  //.replace(/\/\/.*(?=[\n\t])/g, '')
      code = code.replace(/^\s*\/\/.*(?=[\n\t])/mg, '') //单行注释
                  .replace( /^\s*\/\*[\s\S]*?\*\/\s*$/mg, '' ); //多行注释

      var char,
          s = '',
          index = 0,
          startQuote,
          isDoubleSlashComment = false,
          isAsteriskComment = false;

      while ( char = code[index++] ) {

          //匹配单引号或者双引号字符串
          if ( !isDoubleSlashComment && !isAsteriskComment && (char == "'" || char == '"') ) {
              if ( !startQuote ) {
                  startQuote = char;
              } else if ( startQuote == char ) {
                  startQuote = '';
              }
          }

          if ( startQuote ) {
              s += char;
              continue;
          }

          if ( isDoubleSlashComment || isAsteriskComment ) {
              if ( isDoubleSlashComment ) {
                  if ( char == '\n' ) {
                      isDoubleSlashComment = false;
                  }
              } else {
                  if ( char == '/' && code[index-2] == '*' ) {
                      isAsteriskComment = false;
                  }
              }
          } else {
              if ( char == '/' && code[index] == '/' ) { //行尾双斜线注释开始
                  isDoubleSlashComment = true;
              } else if ( char == '/' && code[index] == '*' ) { //单行星号注释
                  isAsteriskComment = true;
              } else {
                  s += char;
              }
          }
      }

      return s;
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

      code = removeComments( code );

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
      relativePath = path.relative( options.relativePath, relativePath );
    }

    var id = path.join(path.dirname(relativePath), path.basename(relativePath, path.extname(relativePath)));
    return id.replace(/\\/g,'/');
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
      var _contents = file.contents.toString(enc);
      var contents = removeComments( _contents );

      var partial = '';
      var useBox = '';
      var bracketStack = [];

      var lastContent = contents;
      var char = '', index = 0, id, deps;


      if ( REG_HAS_USE.test(contents) ) { //处理cola.use

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
          contents = _contents;
        } else {
          deps = parseDeps(contents);
          id = getModuleID(file, options);
          if ( options.ns ) {
            contents = options.ns + '.define("' + id + '", ' + JSON.stringify( deps ) + ', function (require, exports, module) {'
              + '\n' + _contents
              + '\n} );';
          } else {
            contents = 'define("' + id + '", ' + JSON.stringify( deps ) + ', function (require, exports, module) {'
              + '\n' + _contents
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
