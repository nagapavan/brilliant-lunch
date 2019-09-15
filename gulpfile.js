/*jshint esversion: 6 */
var gulp = require("gulp");
var ts = require("gulp-typescript");
var gulpTsLint = require("gulp-tslint");
var del = require("del");
var runSequence = require('run-sequence');
var tslint = require("tslint");
var zip = require('gulp-zip');


// Constants
var Asset_Files = [
  "package.json"
];

var pkg = require('./package.json');
var archive_name = pkg.name + '_v' + pkg.version + '.zip';

// pull in the project TypeScript config
var tsProject = ts.createProject("tsconfig.json");

// gulp.task("scripts", () => {
//   return tsProject.src()
//     .pipe(tsProject())
//     .js
//     .pipe(gulp.dest('dist'));
// });
gulp.task('scripts', () => {
  var tsResult =tsProject.src()
      .pipe(tsProject());

  return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task("assets", () => {
  return gulp.src(Asset_Files)
    .pipe(gulp.dest("dist"));
});


gulp.task("tslint", () => {
  var program = tslint.Linter.createProgram("./tsconfig.json");
  return gulp.src("src/**/*.ts")
    .pipe(gulpTsLint({
      configuration: "tslint.json",
      formatter: "verbose",
      program
    }))
    .on("error", (error) => {
      console.error(error.toString());
      return;
    })
    .pipe(gulpTsLint.report());
});

// First we need to clean out the dist folder and remove the compiled zip file.
gulp.task('clean-dist', () => {
  return del('./dist');
});

gulp.task('clean-archive', () => {
  return del('./' + archive_name);
});
gulp.task('clean', gulp.series( gulp.parallel('clean-dist', 'clean-archive')));

// Now the dist directory is ready to go. Zip it.
gulp.task('zip', () => {
  return gulp.src(['dist/**/*', 'dist/.*'])
    .pipe(zip(archive_name))
    .pipe(gulp.dest('./'));
});

// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------
gulp.task('build', gulp.series('clean', 'tslint', 'scripts', 'assets', 'zip'));

gulp.task('default', gulp.parallel('build'));

