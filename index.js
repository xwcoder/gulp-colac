'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var Transform = require('readable-stream/transform')

module.exports = function (options) {

  //console.log( stream.Transform );

	return through.obj(function (file, enc, cb) {

    console.log( file.path );
    console.log( file.cwd );
    console.log( enc );

		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-colac', 'Streaming not supported'));
			return;
		}

		try {
			file.contents = new Buffer(file.contents.toString(), options);
			this.push(file);
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-colac', err));
		}

		cb();
	});
};
