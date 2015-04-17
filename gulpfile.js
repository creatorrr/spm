var fs = require('fs'),
    path = require('path'),

    gulp = require('gulp'),
    babel = require('gulp-babel'),

    browserify = require('browserify'),
    babelify = require('babelify'),
    envify = require('envify/custom'),
    exorcist = require('exorcist'),

    mkdirp = require('mkdirp'),
    rimraf = require('rimraf'),

    config = require('./package');

gulp.task('transpile', function () {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('.'));
});

gulp.task('dist', function () {
  var outDir = 'dist',
      builds = {
        "./src": config.name
      };

  // Make sure the dist directory is clean
  rimraf.sync(outDir);
  mkdirp.sync(outDir);

  // Make bundles for distribution
  for (var entry in builds) {
    var
      buildName = builds[entry],
      build = path.join(outDir, buildName+'.js');

    processBundle(entry, build, true);
  }

  function processBundle (entry, path, minify) {
    var
      outStream = fs.createWriteStream(path, 'utf8'),

      bundle = browserify({
        debug: true
      }).transform(babelify);

    if (minify)
      bundle.transform(envify({
        NODE_ENV: 'production',
        _: 'purge'
      }))
      .transform({
        global: true
      }, 'uglifyify');


    return (
      bundle
        .add(require.resolve(entry), { entry: true })
        .bundle()
        .on('error', function (e) { console.log(e); })
        .pipe(exorcist(path + '.map'))
        .pipe(outStream)
    );
  }
});

gulp.task('watch', ['build'], function () {
  gulp.watch(['src/**/*.js'], ['build']);
});

gulp.task('build', ['transpile', 'dist']);
