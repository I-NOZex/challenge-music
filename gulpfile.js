var gulp = require('gulp');
var del = require('del');
var htmlmin = require('gulp-html-minifier');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');

var devPaths = {
    html: './dev/*.html',
    scripts: ['./dev/js/**.js'],
    sass: './dev/style/base.scss',
    vendor: {
            //BOOTSTRAP files
            bootstrap: [
                './node_modules/bootstrap/dist/js/*.min.js',
                './node_modules/bootstrap/dist/css/*.min.css',
                './node_modules/bootstrap/dist/fonts/*.*'
            ],
            //VUE files
            vue: ['./node_modules/vue/dist/vue.min.js']
    }
};

var prodPaths = {
    root : './prod',
    scripts: './prod/js',
    vendor: {
        root: './prod/vendor',
        bootstrap: './prod/vendor/bootstrap',
        vue: './prod/vendor/vue'
    },
    styles: './prod/style'
};


gulp.task('clean', function() {
    return del([
        prodPaths.scripts,
        prodPaths.vendor.root,
        prodPaths.styles,
        './prod/*.html'
    ]);
});

// Minify & compress html
gulp.task('html-minify', ['clean'], function() {
    return gulp.src(devPaths.html)
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(prodPaths.root))
});

gulp.task('scripts', ['clean'], function() {
    // Minify and copy all JavaScript (except vendor scripts)
    // with sourcemaps all the way down
    return gulp.src(devPaths.scripts)
        .pipe(uglify())
        .pipe(gulp.dest(prodPaths.scripts));
});

// Compile SASS to static minified CSS
gulp.task('sass', ['clean'], function() {
    return gulp.src(devPaths.sass)
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(gulp.dest(prodPaths.styles));
});

// Copy vendor boostrap
gulp.task('copy-bootstrap', ['clean'], function() {

    return gulp.src(devPaths.vendor.bootstrap, {base: "./node_modules/bootstrap/dist"})
        .pipe(gulp.dest(prodPaths.vendor.bootstrap));
});

// Copy vendor vuejs
gulp.task('copy-vue', ['clean'], function() {
    return gulp.src(devPaths.vendor.vue, {base: "./node_modules/vue/dist"})
        .pipe(gulp.dest(prodPaths.vendor.vue));
});

//copy vendors
gulp.task('copy-vendors', ['copy-bootstrap','copy-vue']);

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(devPaths.html ['html-minify']);
    gulp.watch(devPaths.sass ['sass']);
    gulp.watch(devPaths.scripts ['scripts']);
});

//development task
gulp.task('start', ['watch', 'copy-vendors', 'html-minify', 'scripts', 'sass']);
//release task
gulp.task('release', ['copy-vendors', 'html-minify', 'scripts', 'sass']);