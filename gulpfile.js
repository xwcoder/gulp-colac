var gulp = require( 'gulp' );
var cola = require( './index' );

gulp.task( 'default', function () {
  gulp.src( 'js/lib/*.js' )
      .pipe( cola() )
} );
