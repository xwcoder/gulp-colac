# gulp-colac

> gulp plugin for [cola](https://github.com/xwcoder/cola)

the plugin do 3 things:
1. parse dependent modules, and add `define wrap` to module files
2. parse dependent modules for files which using `cola.use`
3. order output stream: put file to last positoin which contains `cola.use`


## Install

```
$ npm install --save-dev gulp-colac
```


## Usage

```js
var gulp = require('gulp');
var colac = require('gulp-colac');

gulp.task('default', function () {
	return gulp.src('src/file.ext')
		.pipe(colac())
		.pipe(gulp.dest('dist'));
});
```


## API

### colac(options)

#### options

##### relativePath 

Type: `String`  
Default: `null`

ignore `relativePath` when using `file path` to generate module id.


## License

MIT © [creep](http://xwcoder.github.io)
