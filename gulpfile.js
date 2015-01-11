var gulp = require('gulp');

var es = require('event-stream');
var coffee = require('gulp-coffee');
var plumber = require('gulp-plumber');
var rimraf = require('rimraf');

var coffeeSrc = 'src/**/*.coffee';

function buildCoffee() {
    return gulp.src(coffeeSrc)
        .pipe(plumber())
        .pipe(coffee({ bare: true }))
        .pipe(gulp.dest('dist'));
}

gulp.task('clean', function(cb) {
    rimraf('dist', cb);
});

gulp.task('default', ['clean'], function () {
    buildCoffee();
});