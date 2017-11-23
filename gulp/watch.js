'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var browserSync = require('browser-sync');

function isOnlyChange(event) {
    return event.type === 'changed';
}

gulp.task('watch', ['inject'], function() {

    gulp.watch([path.join(conf.paths.src, '/*.html'), 'bower.json'], ['inject']);

    gulp.watch([
        path.join(conf.paths.src, '/app/**/*.css'),
        path.join(conf.paths.src, '/app/*.less'),
        path.join(conf.paths.src, '/app/**/*.less')
    ], function(event) {
      /*gulp.start('styles');
      gulp.start('inject');*/
      if (isOnlyChange(event)) {
            gulp.start('styles');
            gulp.start('inject');
        } else {
            gulp.start('inject');
        }
    });

    gulp.watch(path.join(conf.paths.src, '/app/**/*.js'), function(event) {
        if (isOnlyChange(event)) {
            gulp.start('scripts');
        } else {
            gulp.start('inject');
        }
    });

    gulp.watch(path.join(conf.paths.src, '/app/json/*.json'), function() {
        gulp.start('build');
    });

    gulp.watch([
      path.join(conf.paths.src, '/app/*.html'),
      path.join(conf.paths.src, '/app/**/*.html')
      ], function(event) {
        console.log( 'Watching html' );
        browserSync.reload(event.path);
    });
});
