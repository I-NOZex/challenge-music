var gulp = require('gulp');
var del = require('del');
var htmlmin = require('gulp-html-minifier');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');

var devPaths = {
    html: './dev/*.html',
    scripts: ['./dev/js/**.js'],
    sass: './dev/style/*.scss',
    images: './dev/img/*.*',
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
    images: './prod/img',
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
var task_htmlMinify = function(){
        return gulp.src(devPaths.html)
            .pipe(htmlmin({collapseWhitespace: true}))
            .pipe(gulp.dest(prodPaths.root))

}
gulp.task('html-minify', ['clean'], task_htmlMinify);
gulp.task('html-minify-watch', task_htmlMinify);


// Minify and copy all JavaScript (except vendor scripts)
// with sourcemaps all the way down
var task_scripts = function(){
    return gulp.src(devPaths.scripts)
        .pipe(uglify())
        .pipe(gulp.dest(prodPaths.scripts));
}

gulp.task('scripts', ['clean'], task_scripts);
gulp.task('scripts-watch', task_scripts);

// Compile SASS to static minified CSS
var task_sass = function(){
        return gulp.src(devPaths.sass)
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
            //.pipe(autoprefixer())
            .pipe(gulp.dest(prodPaths.styles));
};
gulp.task('sass', ['clean'], task_sass);
gulp.task('sass-watch', task_sass);


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

// Copy images
gulp.task('copy-images', ['clean'], function() {
    return gulp.src(devPaths.images)
        .pipe(gulp.dest(prodPaths.images));
});


// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(devPaths.html, ['html-minify-watch']);
    gulp.watch('./dev/style/**.scss', ['sass-watch']);
    gulp.watch(devPaths.scripts, ['scripts-watch']);
});

//release task
gulp.task('release', ['clean', 'copy-images', 'copy-vendors', 'html-minify', 'scripts', 'sass']);
//development task
gulp.task('start', ['release', 'watch']);