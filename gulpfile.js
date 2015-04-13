var gulp = require("gulp");
var gulpConnect = require('gulp-connect');

gulp.task('tests', function() {
  gulpConnect.server();
});
