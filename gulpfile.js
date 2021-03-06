var gulp = require('gulp')
var tsc = require('gulp-typescript')
var del = require('del')

gulp.task('default', function () {
  var project = tsc.createProject('tsconfig.json')
  return project.src()
        .pipe(project())
        .js.pipe(gulp.dest('dist'))
})

gulp.task('clean', function() {
  return del([
    "dest/**",
    "src/**/*.js", 
    "src/**/*.js.map"
    ])
})