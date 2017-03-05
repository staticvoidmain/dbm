var gulp = require('gulp')
var ts = require('gulp-typescript')
var tsProject = ts.createProject('tsconfig.json')

// todo: this is gonna need a lot of work.
gulp.task('default', function () {
  return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('dist'))
})
