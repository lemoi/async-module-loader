const sourcemaps = require('gulp-sourcemaps');
const gulp=require('gulp');
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
