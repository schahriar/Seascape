var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var less = require('gulp-less');
var path = require('path');

var lessc = function() {
    gulp.src('./stylesheets/style.less')
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(autoprefixer({
            browsers: ['last 5 version'],
            cascade: true
        }))
        .on('error', gutil.log.bind(gutil, 'Less Error'))
        .pipe(gulp.dest('./dist/'));
    gutil.log(gutil.colors.cyan('Less render'), gutil.colors.magenta('complete'));
    gutil.beep();
}

gulp.task('default', function() {

    var bundler = watchify(browserify('./scripts/master.js', watchify.args));

    lessc();
    gulp.watch('./stylesheets/*.less', lessc);

    bundler.on('update', rebundle);
    bundler.on('time', function(time) {
        gutil.beep();
        gutil.log(gutil.colors.cyan('Browserify took: '), time, gutil.colors.red('ms'));
    });

    function rebundle() {
        return bundler.bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source('./dist/bundle.js'))
            /*.pipe(streamify(uglify()))*/
            .pipe(gulp.dest('./'));
    }

    return rebundle();
});
