const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const fileInclude = require('gulp-file-include');

const paths = {
  html: {
    src: 'src/html/**/*.html',
    exclude: '!src/html/include/**',
    dest: 'html/'
  },

  styles: {
    src: 'src/assets/scss/main.scss',
    watch: 'src/assets/scss/**/*.scss',
    dest: 'assets/css/'
  }
};

function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())

    .pipe(
      sass({
        outputStyle: 'expanded'
      }).on('error', sass.logError)
    )

    .pipe(
      postcss([
        autoprefixer()
      ])
    )

    .pipe(sourcemaps.write('.'))

    .pipe(gulp.dest(paths.styles.dest))

    .pipe(browserSync.stream());
}

function html() {
  return gulp.src([
      paths.html.src,
      paths.html.exclude
    ])

    .pipe(
      fileInclude({
        prefix: '@@',
        basepath: '@file'
      })
    )

    .pipe(gulp.dest(paths.html.dest))

    .pipe(browserSync.stream());
}

function serve() {
  browserSync.init({
    server: {
      baseDir: './'
    },
    startPath: '/html/',
    port: 3000
  });
}

function watchFiles() {
  gulp.watch(paths.styles.watch, styles);
  gulp.watch(paths.html.src, html);
}

function cssMinify() {
  return gulp.src('assets/css/main.css')

    .pipe(cleanCSS())

    .pipe(rename({
      suffix: '.min'
    }))

    .pipe(gulp.dest('assets/css'));
}

exports.styles = styles;
exports.html = html;

exports.build = gulp.series(
  gulp.parallel(styles, html),
  cssMinify
);

exports.default = gulp.series(
  gulp.parallel(styles, html),
  gulp.parallel(serve, watchFiles)
);
