var gulp = require('gulp')
var tsc = require('gulp-typescript')

gulp.task('default', function () {
  var project = tsc.createProject('tsconfig.json')
  return project.src()
        .pipe(project())
        .js.pipe(gulp.dest('dist'))
})