var gulp = require('gulp');
var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('templates', function(){
    gulp.src('source/templates/**/*.hbs')
        .pipe(handlebars())
        .pipe(wrap('Handlebars.template(<%= contents %>)'))
        .pipe(declare({
            namespace: '$.tv.templates',
            noRedeclare: true, // Avoid duplicate declarations
        }))
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('source/js/'));
});

gulp.task('scripts', function() {
    gulp.src([
            'vendor/js/lodash.js', 
            'vendor/js/**/**.js', 
            'source/js/**/*.js'
        ])
        .pipe(sourcemaps.init())
            .pipe(concat('app.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/js'));
});

gulp.task('sass', function () {
    gulp.src(['vendor/styles/**/*.scss', 'source/styles/**/*.scss'])
        .pipe(sourcemaps.init())
            .pipe(sass())
        .pipe(sourcemaps.write())
        .pipe(concat('screen.css'))
        .pipe(gulp.dest('public/css/'));
});