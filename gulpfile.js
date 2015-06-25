// Load plugins
var gulp = require('gulp'),
    shell = require('gulp-shell');

////////////////////////
// CLIENT WEB SITE

// Media
gulp.task('media', function() {
  return gulp.src(['src/media/**/*.jpg', 'src/media/**/*.jpeg', 'src/media/**/*.png', 'src/media/**/*.svg', 'src/media/**/*.gif', 'src/media/**/*.tiff', 'src/media/**/*.mp3', 'src/media/**/*.ogg'])
    .pipe(gulp.dest('www/media'));
});

// STYLE
gulp.task('scss', function() {
  var sass = require('gulp-sass');
  var autoprefixer = require('gulp-autoprefixer');
  var minifycss = require('gulp-minify-css');
  var rename = require('gulp-rename');
  var concat = require('gulp-concat');

  return gulp.src(['src/styles/index.scss'])
    .pipe(sass({errLogToConsole: true}))
    .pipe(concat('index.css'))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 2.3'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('www/styles'));
});

// MARKUP
gulp.task('jade', function() {
  var localSymbols = {};
  var jade = require('gulp-jade');

  return gulp.src('src/**/*.jade')
  .pipe(jade({
    locals: localSymbols
  }))
  .pipe(gulp.dest('www/'));
});

gulp.task('html', function() {
  // var htmlmin = require('gulp-htmlmin');

  return gulp.src(['src/{,views/}*.html'])
//.pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('www/'));
});

// JAVASCRIPT
gulp.task('jshint', function() {
  var jshint = require('gulp-jshint');

  return gulp.src(['server.js', 'controllers/**/*.js', 'models/**/*.js', 'src/scripts/**/*.js', 'src/admin/scripts/**/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'));
});

gulp.task('javascript', function() {
  var uglify = require('gulp-uglify');
  var rename = require('gulp-rename');
  var concat = require('gulp-concat');

  return gulp.src(['src/scripts/**/*.js'])
    .pipe(concat('index.js'))
    .pipe(gulp.dest('www/scripts'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify({mangle: false}))
    .pipe(gulp.dest('www/scripts'));
});


gulp.task('jsVendor', function() {
  var uglify = require('gulp-uglify');
  var rename = require('gulp-rename');
  var concat = require('gulp-concat');

  // gulp.src('src/vendor/*.map')
  // .pipe(gulp.dest('www/scripts'));

  return gulp.src(['src/vendor/angular.min.js', 'src/vendor/angular-route.js', 'src/vendor/angular-gettext.min.js'])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('www/scripts'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify({mangle: false}))
    .pipe(gulp.dest('www/scripts'));
});

gulp.task('cssVendor', function() {
  var concat = require('gulp-concat');
  var sass = require('gulp-sass');
  var minifycss = require('gulp-minify-css');
  
  return gulp.src(['src/vendor/**/*.css'])
    .pipe(sass({errLogToConsole: true}))
    .pipe(concat('vendor.min.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('www/styles'));
});

gulp.task('fontVendor', function() {
  return gulp.src(['src/fonts/*'])
    .pipe(gulp.dest('www/fonts'));
});

gulp.task('admin', function() {
  return gulp.src(['src/admin/*'])
    .pipe(gulp.dest('www/admin'));
});


////////////////////////
// ADMIN SITE

// STYLE
// gulp.task('lessAdmin', function() {
//   var less = require('gulp-less');
//   var autoprefixer = require('gulp-autoprefixer');
//   var minifycss = require('gulp-minify-css');
//   var rename = require('gulp-rename');
//   var concat = require('gulp-concat');

//   return gulp.src(['src/admin/styles/index.less'])
//     .pipe(less())
//     .pipe(concat('index.css'))
//     .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 2.3'))
//     .pipe(rename({ suffix: '.min' }))
//     .pipe(minifycss())
//     .pipe(gulp.dest('www/admin/styles'));
// });

// gulp.task('cssVendorAdmin', function() {
//   var concat = require('gulp-concat');
//   var minifycss = require('gulp-minify-css');
//   return gulp.src([
//       'src/admin/vendor/bootstrap.min.css', 
//       'src/admin/vendor/sb-admin-2.css', 
//       'src/admin/vendor/plugins/metisMenu/metisMenu.min.css',
//       'src/admin/vendor/plugins/morris/morris.min.css'
//     ])
//     .pipe(concat('vendor.min.css'))
//     .pipe(minifycss())
//     .pipe(gulp.dest('www/admin/styles'));
// });

// // MARKUP
// gulp.task('jadeAdmin', function() {
//   var localSymbols = {};
//   var jade = require('gulp-jade');

//   return gulp.src('src/admin/**/*.jade')
//   .pipe(jade({
//     locals: localSymbols
//   }))
//   .pipe(gulp.dest('www/admin/'));
// });

// gulp.task('htmlAdmin', function() {
//   // var htmlmin = require('gulp-htmlmin');

//   return gulp.src(['src/admin/**/*.html'])
// //.pipe(htmlmin({collapseWhitespace: true}))
//     .pipe(gulp.dest('www/admin/'));
// });

// gulp.task('javascriptAdmin', function() {
//   var uglify = require('gulp-uglify');
//   var rename = require('gulp-rename');
//   var concat = require('gulp-concat');

//   return gulp.src(['src/admin/scripts/**/*.js'])
//     .pipe(concat('index.js'))
//     .pipe(gulp.dest('www/admin/scripts'))
//     .pipe(rename({ suffix: '.min' }))
//     .pipe(uglify({mangle: false}))
//     .pipe(gulp.dest('www/admin/scripts'));
// });

// gulp.task('jsVendorAdmin', function() {
//   var rename = require('gulp-rename');
//   var concat = require('gulp-concat');
//   // gulp.src('src/admin/vendor/*.map')
//   // .pipe(gulp.dest('www/scripts'));

//   return gulp.src([
//       'src/admin/vendor/jquery.js', 
//       'src/admin/vendor/angular.min.js', 'src/admin/vendor/angular-animate.min.js', 'src/admin/vendor/angular-cookies.min.js', 'src/admin/vendor/angular-route.min.js', 
//       'src/admin/vendor/bootstrap.min.js', 
//       'src/admin/vendor/rect-ng.js', 
//       'src/admin/vendor/plugins/metisMenu/metisMenu.min.js', 
//       'src/admin/vendor/plugins/morris/morris.min.js', 'src/admin/vendor/plugins/morris/raphael.min.js'
//     ])
//     .pipe(concat('vendor.js'))
//     .pipe(gulp.dest('www/admin/scripts'))
//     .pipe(rename({ suffix: '.min' }))
//     .pipe(gulp.dest('www/admin/scripts'));
// });

// gulp.task('modernizrAdmin', function() {
//   return gulp.src(['src/admin/vendor/modernizr.min.js'])
//     .pipe(gulp.dest('www/admin/scripts'));
// });

// gulp.task('fontVendorAdmin', function() {
//   return gulp.src(['src/admin/fonts/*', 'src/admin/vendor/font-awesome/fonts/*'])
//     .pipe(gulp.dest('www/admin/fonts'));
// });

// gulp.task('fontAwesomeAdmin', function() {
//   return gulp.src(['src/admin/vendor/font-awesome/css/font-awesome.min.css'])
//     .pipe(gulp.dest('www/admin/styles'));
// });


// TRANSLATIONS

gulp.task('po:extract', ['html', 'jade', 'javascript'], function () {
  var gettext = require('gulp-angular-gettext');
  return gulp.src(['www/views/**/*.html', 'www/scripts/**/*.js'])
    .pipe(gettext.extract('template.pot', {
        // options to pass to angular-gettext-tools... 
    }))
    .pipe(gulp.dest('po/'));
});
 
gulp.task('po:compile', function () {
  var gettext = require('gulp-angular-gettext');
  return gulp.src('po/**/*.po')
    .pipe(gettext.compile({
        // options to pass to angular-gettext-tools... 
        // format: 'json'
    }))
    .pipe(gulp.dest('src/scripts/lang/'));
});


////////////////////////
// Clean
gulp.task('clean', function() {
  var clean = require('gulp-clean');

  return gulp.src(['www/*'])
    .pipe(clean());
});

// Groups
gulp.task('vendor', ['jsVendor', 'cssVendor', 'fontVendor'], function(){});

gulp.task('scripts', ['jshint', 'javascript'], function(){});

gulp.task('markup', ['jade', 'html'], function(){});

gulp.task('styles', ['scss'], function(){});

gulp.task('make', function(cb) {
    var runSequence = require('run-sequence');
    runSequence('clean', ['markup', 'scripts', 'styles', 'media', 'vendor', 'admin'/*, 'makeAdmin'*/], cb);
});

// gulp.task('makeAdmin', function(cb) {
//     var runSequence = require('run-sequence');
//     runSequence(['htmlAdmin', 'jadeAdmin', 'lessAdmin', 'cssVendorAdmin', 'javascriptAdmin', 'modernizrAdmin', 'jsVendorAdmin', 'fontVendorAdmin', 'fontAwesomeAdmin'], cb);
// });

// Default task
gulp.task('default', function() {
  console.log("\nAvailable actions:\n");
  console.log("   $ gulp make         Compile the web files to 'www/{client,admin}'");
  console.log("   $ gulp debug        Compile, start the app locally and reload with Nodemon");
  console.log("   $ gulp po:extract   Generate the translation template");
  console.log("   $ gulp po:compile   Generate the JSON files for each language");
  console.log("  ");
  console.log("   $ gulp start        Start the server as a daemon (implies gulp make)");
  console.log("   $ gulp restart      Restart the server (implies gulp make)");
  console.log("   $ gulp stop         Stop the server\n");
  console.log("  ");
});

// MAIN TASKS
gulp.task('debug', ['make'], function () {
  var nodemon = require('gulp-nodemon');

  nodemon({ script: 'server.js', ext: 'html jade js css scss ', ignore: ['test', 'www', 'node_modules'], nodeArgs: ['--debug']  })
    .on('change', ['make'])
    .on('restart', function () {
      console.log('App restarted');
    });
});

gulp.task('start', ['make'], shell.task([
  'forever start server.js 2>/dev/null || node server.js'
]));

gulp.task('restart', ['make'], shell.task([
  'forever restart server.js 2>/dev/null || echo "The forever command is not installed.\nTo stop the server, just hit Ctrl+C in the terminal where your Node app is running and launch it again" '
]));

gulp.task('stop', shell.task([
  'forever stop server.js 2>/dev/null || echo "The forever command is not installed.\nTo stop the server, just hit Ctrl+C in the terminal where your Node app is running" '
]));

// gulp.task('test', ['make'], function () {
//   var mocha = require('gulp-mocha');
//   gulp.src('test/index.js')
//       .pipe(mocha({reporter: 'nyan'}));
// });
