/**
 * Build configuration for server-side using Gulp
 */
const gulp = require('gulp');
const sourceMaps = require('gulp-sourcemaps');
const nodemon = require('gulp-nodemon');
const babel = require('gulp-babel');
const path = require('path');
const config = require('./src/config/server.config').build;

const PATHS = {
  src: ['src/**/*.js', 'src/**/*.jsx'],
  dist: config.serverOutputDirectoryName,
  sourceRoot: path.join(__dirname, config.sourceDirectory),
};

const compile = () => gulp.src(PATHS.src)
  .pipe(sourceMaps.init())
  .pipe(babel({ presets: [['env', { targets: { node: 'current' } }]] }))
  .pipe(sourceMaps.write('.', { sourceRoot: PATHS.sourceRoot }))
  .pipe(gulp.dest(PATHS.dist));

gulp.task('server-build', gulp.series(compile));

gulp.task('dev-server', gulp.series(done => nodemon({
  exec: 'node --inspect',
  script: `${PATHS.dist}/${config.serverEntry}`,
  ext: 'js html',
  ignore: ['**/*.test.js', `${PATHS.dist}/**/*.js`],
  env: { NODE_ENV: 'development' },
  tasks: ['server-build'],
  debug: true,
  done,
})));

gulp.task('dev-start', gulp.series(['server-build', 'dev-server']));
