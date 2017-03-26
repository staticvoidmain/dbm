var gulp = require('gulp')
var newer = require('gulp-newer')
var tsc = require('gulp-typescript')
// var mocha = require('./test/mocha-parallel')
var tsProject = tsc.createProject('tsconfig.json')

gulp.task('default', function () {
  return tsProject.src()
        .pipe(newer())
        .pipe(tsProject())
        .js.pipe(gulp.dest('dist'))
})
