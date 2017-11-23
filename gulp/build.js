'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('partials', function() {
    return gulp.src([
            path.join(conf.paths.src, '/app/**/*.html'),
            path.join(conf.paths.tmp, '/serve/app/**/*.html')
        ])
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe($.angularTemplatecache('templateCacheHtml.js', {
            module: 'synergicaWeb',
            root: 'app'
        }))
        .pipe(gulp.dest(conf.paths.tmp + '/partials/'));
});

gulp.task('html', ['inject', 'partials'], function() {
    var partialsInjectFile = gulp.src(path.join(conf.paths.tmp, '/partials/templateCacheHtml.js'), {
        read: false
    });
    var partialsInjectOptions = {
        starttag: '<!-- inject:partials -->',
        ignorePath: path.join(conf.paths.tmp, '/partials'),
        addRootSlash: false
    };

    var htmlFilter = $.filter('*.html');
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');
    var assets;

    return gulp.src(path.join(conf.paths.tmp, '/serve/*.html'))
        .pipe($.inject(partialsInjectFile, partialsInjectOptions))
        .pipe(assets = $.useref.assets())
        .pipe($.rev())
        .pipe(jsFilter)
        .pipe($.ngAnnotate())
        .pipe($.uglify({
            preserveComments: $.uglifySaveLicense
        })).on('error', conf.errorHandler('Uglify'))
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.replace('../../bower_components/bootstrap-sass-official/assets/fonts/bootstrap/', '../fonts/'))
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe(htmlFilter)
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true,
            conditionals: true
        }))
        .pipe(htmlFilter.restore())
        .pipe( $.replace('<script ', '<script defer '))
        .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
        .pipe($.size({
            title: path.join(conf.paths.dist, '/'),
            showFiles: true
        }));
});

// Only applies for fonts from bower dependencies
// Custom fonts are handled by the "other" task
gulp.task('fonts', function() {
    return gulp.src($.mainBowerFiles())
        .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
        .pipe($.flatten())
        .pipe(gulp.dest(path.join(conf.paths.dist, '/fonts/')));
});

gulp.task('other', function() {
    var fileFilter = $.filter(function(file) {
        return file.stat.isFile();
    });

    return gulp.src([
            path.join(conf.paths.src, '/**/*'),
            path.join('!' + conf.paths.src, '/**/*.{html,css,js,scss,less,json}')
        ])
        .pipe(fileFilter)
        .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});

var jsonFilter =$.filter('**/*.json');
gulp.task('jsonminify', function() {
  return gulp.src( path.join(conf.paths.src, '/**/*') )
    .pipe(jsonFilter)
    .pipe($.jsonminify())
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});

var thirdPartyAssetsFilter =$.filter('**/*.*');
gulp.task('thirdPartyAssets', function() {
  return gulp.src( path.join(conf.paths.apache, '/styles/images/**/*') )
    .pipe(thirdPartyAssetsFilter)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/styles/images/')));
});

var htaccessFilter =$.filter('**/*.htaccess');
gulp.task('htaccess', function() {
  return gulp.src( path.join(conf.paths.apache, '/**/*') )
    .pipe(htaccessFilter)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});

var sitemapFilter =$.filter('**/sitemap.xml');
gulp.task('sitemap', function() {
  return gulp.src( path.join(conf.paths.apache, '/**/*') )
    .pipe(sitemapFilter)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});

var robotsFilter =$.filter('**/robots.txt');
gulp.task('robots', function() {
  return gulp.src( path.join(conf.paths.apache, '/**/*') )
    .pipe(robotsFilter)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});


gulp.task('clean', function(done) {
    $.del([path.join(conf.paths.dist, '/'), path.join(conf.paths.tmp, '/')], done);
});

// var cdnizer = require("gulp-cdnizer");
//
// gulp.task('cdnizerTask ', function() {
//   return gulp.src("./src/index.html")
//         .pipe(cdnizer({
//             defaultCDNBase: "//my.cdn.host/base",
//             allowRev: true,
//             allowMin: true,
//             files: [
//     				// This file is on the default CDN, and will replaced with //my.cdn.host/base/js/app.js
//     				'js/app.js',
// 				// On Google's public CDN
// 				{
// 					file: 'vendor/angular/angular.js',
// 					package: 'angular',
// 					test: 'window.angular',
// 					cdn: '//ajax.googleapis.com/ajax/libs/angularjs/${ version }/angular.min.js'
// 				},
//
// 				// On Firebase's public CDN
// 				{
// 					file: 'vendor/firebase/firebase.js',
// 					test: 'window.Firebase',
// 					cdn: '//cdn.firebase.com/v0/firebase.js'
// 				}
// 			]
//         }))
//         .pipe(gulp.dest("./dist"));
// });

gulp.task('build', ['html', 'fonts', 'other','jsonminify','thirdPartyAssets','sitemap','robots']);
gulp.task('build:local', ['build', 'htaccess']);
