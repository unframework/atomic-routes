var gulp = require('gulp');

var es = require('event-stream');
var coffee = require('gulp-coffee');
var karma = require('gulp-karma');
var plumber = require('gulp-plumber');
var rimraf = require('rimraf');

var coffeeSrc = 'src/**/*.coffee';
var testSrc = 'test/**/*.coffee';

function buildCoffee() {
    return gulp.src(coffeeSrc)
        .pipe(plumber())
        .pipe(coffee({ bare: true }));
}

gulp.task('clean', function(cb) {
    rimraf('dist', cb);
});

gulp.task('test', function() {
    return es.concat(
        gulp.src(__dirname + '/node_modules/bluebird/js/browser/bluebird.js'),
        gulp.src(coffeeSrc),
        gulp.src(testSrc)
    )
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        }));
});

gulp.task('default', ['clean', 'test'], function () {
    buildCoffee().pipe(gulp.dest('dist'));
});