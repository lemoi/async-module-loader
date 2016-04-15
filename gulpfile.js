const sourcemaps = require('gulp-sourcemaps');
const gulp=require('gulp');
const exec = require('child_process').exec;
const uglify=require('gulp-uglify');
const rename = require('gulp-rename');
gulp.task('compress', function() {
  return gulp.src('./src/loader.js')
  	.pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename({suffix:'.min'}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'));
});
gulp.task('server-start',function(){
	exec('node static_server.js',function(err,stdout,stderr){
	  if (err) {
	    console.error(err);
	    return;
	  }
	});
});
gulp.task('open-browser',function(){
	exec('start http://127.0.0.1:3000/test.html',function(err,stdout,stderr){
	  if (err) {
	    console.error(err);
	    return;
	  }
	});
});
gulp.task('default',['server-start','open-browser']);
gulp.watch('./src/*.js', ['compress']);