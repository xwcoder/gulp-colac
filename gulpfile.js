var gulp = require( 'gulp' );
var cola = require( './index' );
var through = require('through2');
//var concat = require('gulp-concat');
var concat = require('./concat');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('default', function () {
  gulp.watch('js/lib/*.js', function () {
    gulp.src(['js/lib/*.js', '!js/lib/base.js'])
      .pipe(cola({relativePath: 'js'}))
      //.pipe(sourcemaps.init())
      .pipe(through.obj(function (file, enc, cb) {
        console.log(file.path);
        this.push(file);
        cb();
      }))
      .pipe(concat('base.js'))
      //.pipe(sourcemaps.write())
      .pipe(gulp.dest('js/lib'))
  });

  //gulp.src(['js/lib/*.js', '!js/lib/base.js'])
  //  .pipe(cola({relativePath: 'js'}))
  //  //.pipe(sourcemaps.init())
  //  .pipe(through.obj(function (file, enc, cb) {
  //    console.log(file.path);
  //    this.push(file);
  //    cb();
  //  }))
  //  .pipe(concat('base.js'))
  //  //.pipe(sourcemaps.write())
  //  .pipe(gulp.dest('js/lib'))
} );

gulp.task('use', function () {
    gulp.src(['js/inc.js' ])
      .pipe(cola({relativePath: 'js'}))
      .pipe(through.obj(function (file, enc, cb) {
        console.log(file.path);
        this.push(file);
        cb();
      }))
      //.pipe(concat('inc.js'))
      .pipe(gulp.dest('js/'))
});
