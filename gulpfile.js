// FILE PATHS
var mediaPaths = ['src/media/**/*.jpg', 'src/media/**/*.jpeg', 'src/media/**/*.png', 'src/media/**/*.svg', 'src/media/**/*.gif', 'src/media/**/*.tiff', 'src/media/**/*.mp3', 'src/media/**/*.ogg'];
var scssPaths = ['src/styles/index.scss'];

var jadeSymbols = {};
var jadePaths = 'src/{,views/}*.jade';
var htmlPaths = ['src/{,views/}*.html'];
var jsHintPaths = ['server.js', 'controllers/**/*.js', 'models/**/*.js', 'src/scripts/**/*.js'];
var javascriptPaths = ['src/scripts/**/*.js'];
var jsVendorPaths = [
  'src/vendor/angular/angular.min.js', 
  'src/vendor/angular-route/angular-route.min.js', 
  'src/vendor/angular-gettext/dist/angular-gettext.min.js'
];
var cssVendorPaths = [];
var fontVendorPaths = ['src/fonts/*'];
var poExtractPaths = ['www/views/**/*.html', 'www/scripts/**/*.js'];
var poCompilePaths = 'po/**/*.po';


// Load plugins
var gulp = require('gulp'),
    shell = require('gulp-shell'),
    config = require(__dirname + '/controllers/config.js'),
    livereload = require('gulp-livereload');

////////////////////////
// TOOLS
gulp.task('bower', function() {
  var bower = require('gulp-bower');
  return bower().pipe(gulp.dest('src/vendor'))
    .pipe(livereload());
});

////////////////////////
// CLIENT WEB SITE

// Media
gulp.task('media', function() {
  return gulp.src(mediaPaths)
    .pipe(gulp.dest('www/media'))
    .pipe(livereload());
});

// STYLE
gulp.task('scss', function() {
  var sass = require('gulp-sass');
  var autoprefixer = require('gulp-autoprefixer');
  var minifycss = require('gulp-minify-css');
  var rename = require('gulp-rename');
  var concat = require('gulp-concat');

  return gulp.src(scssPaths)
    .pipe(sass({errLogToConsole: true}))
    .pipe(concat('index.css'))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 2.3'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('www/styles'))
    .pipe(livereload());
});

// MARKUP
gulp.task('jade', function() {
  var jade = require('gulp-jade')
  var templateCache = require('gulp-angular-templatecache');

  return gulp.src(jadePaths)
  .pipe(jade({ locals: jadeSymbols }))
  .pipe(gulp.dest('www'))
  .pipe(templateCache({standalone: true}))
  .pipe(gulp.dest('www/scripts'))
  .pipe(livereload());
});

gulp.task('html', function() {
  var htmlmin = require('gulp-htmlmin');

  return gulp.src(htmlPaths)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('www/'))
    .pipe(livereload());
});

// JAVASCRIPT
gulp.task('jshint', function() {
  var jshint = require('gulp-jshint');

  return gulp.src(jsHintPaths)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'));
});

gulp.task('javascript', ['jade'], function() {
  var uglify = require('gulp-uglify');
  var concat = require('gulp-concat');
  var ngAnnotate = require('gulp-ng-annotate');

  var p = gulp.src(javascriptPaths)
    .pipe(concat('index.min.js'))
    .pipe(ngAnnotate());

  if(config.IS_PRODUCTION)
    p.pipe(uglify());

  return p.pipe(gulp.dest('www/scripts'))
    .pipe(livereload());
});

// VENDOR

gulp.task('jsVendor', function() {
  var rename = require('gulp-rename');
  var concat = require('gulp-concat');

  return gulp.src(jsVendorPaths)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('www/scripts'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('www/scripts'))
    .pipe(livereload());
});

gulp.task('cssVendor', function() {
  var concat = require('gulp-concat');
  var sass = require('gulp-sass');
  var minifycss = require('gulp-minify-css');
  
  return gulp.src(cssVendorPaths)
    .pipe(concat('vendor.min.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('www/styles'))
    .pipe(livereload());
});

gulp.task('fontVendor', function() {
  return gulp.src(fontVendorPaths)
    .pipe(gulp.dest('www/fonts'));
});

// TRANSLATIONS

gulp.task('po:extract', ['html', 'jade', 'javascript'], function () {
  var gettext = require('gulp-angular-gettext');
  return gulp.src(poExtractPaths)
    .pipe(gettext.extract('template.pot', {
        // options to pass to angular-gettext-tools... 
    }))
    .pipe(gulp.dest('po/'));
});
 
gulp.task('po:compile', function () {
  var gettext = require('gulp-angular-gettext');
  return gulp.src(poCompilePaths)
    .pipe(gettext.compile({
        // options to pass to angular-gettext-tools... 
        // format: 'json'
    }))
    .pipe(gulp.dest('src/scripts/lang/'))
    .pipe(livereload());
});


////////////////////////
// Clean
gulp.task('clean', function(cb) {
  var del = require('del');
  del(['www/**/*'], cb);
});

////////////////////////
// HTML readme
gulp.task('readme', function() {
  var fs = require('fs');
  var markdown = require('markdown').markdown;
  var gOpen = require("gulp-open");
  var md = fs.readFileSync('README.md').toString();
  var content = markdown.toHTML( md );
  var markdownCSS = '<style>h1,h2,h3,h4,h5,h6,p,blockquote {margin: 0;padding: 0;  }body {font-family: "Helvetica Neue", Helvetica, "Hiragino Sans GB", Arial, sans-serif;font-size: 13px;line-height: 18px;color: #737373;background-color: white;margin: 10px 13px 10px 13px;  }table {margin: 10px 0 15px 0;border-collapse: collapse;  }td,th { border: 1px solid #ddd;padding: 3px 10px;  }th {padding: 5px 10px;  }a {color: #0069d6;  }a:hover {color: #0050a3;text-decoration: none;  }a img {border: none;}  p {margin-bottom: 9px;}h1,h2,h3,h4,  h5,h6 {color: #404040;line-height: 36px;  }h1 {margin-bottom: 18px;font-size: 30px;  }h2 {font-size: 24px;  }h3 {font-size: 18px;  }h4 {font-size: 16px;  }h5 {font-size: 14px;  }h6 {font-size: 13px;  }hr {margin: 0 0 19px;border: 0;border-bottom: 1px solid #ccc;  }blockquote {padding: 13px 13px 21px 15px;margin-bottom: 18px;font-family:georgia,serif;font-style: italic;  }blockquote:before {content:"\201C";font-size:40px;margin-left:-10px;font-family:georgia,serif;color:#eee;  }blockquote p {font-size: 14px;font-weight: 300;line-height: 18px;margin-bottom: 0;font-style: italic;  }code, pre {font-family: Monaco, Andale Mono, Courier New, monospace;  }code {background-color: #fee9cc;color: rgba(0, 0, 0, 0.75);padding: 1px 3px;font-size: 12px;-webkit-border-radius: 3px;-moz-border-radius: 3px;border-radius: 3px;  }pre {display: block;padding: 14px;margin: 0 0 18px;line-height: 16px;font-size: 11px;border: 1px solid #d9d9d9;white-space: pre-wrap;word-wrap: break-word;  }pre code {background-color: #fff;color:#737373;font-size: 11px;padding: 0;  }sup {font-size: 0.83em;vertical-align: super;line-height: 0;}  * {-webkit-print-color-adjust: exact;  }@media screen and (min-width: 914px) {body {width: 854px;margin:10px auto;}  }@media print {body,code,pre code,h1,h2,h3,h4,h5,h6 {color: black;    }table, pre {page-break-inside: avoid;}  }</style>';

  var html = "<html><head><meta charset='UTF-8'> <meta http-equiv='X-UA-Compatible' content='IE=edge'><style>" + markdownCSS + "</style></head><body>" + content + "</body></html>";
  fs.writeFileSync('README.html', html);

  // Launch
  gulp.src("./README.html")
    .pipe(gOpen());

  // Clean
  setTimeout(function(){
    fs.unlink('README.html');
  }, 5000);
});

// Groups
gulp.task('vendor', ['jsVendor', 'cssVendor', 'fontVendor'], function(){});

gulp.task('scripts', ['jshint', 'javascript'], function(){});

gulp.task('markup', ['jade', 'html'], function(){});

gulp.task('styles', ['scss'], function(){});

gulp.task('make', function(cb) {
    var runSequence = require('run-sequence');
    if(config.IS_PRODUCTION) {

      runSequence(['markup', 'scripts', 'styles', 'media', 'vendor'], function (err) {
        if (!err) return cb();
        
        //if any error happened in the previous tasks, exit with a code > 0
        var exitCode = 2;
        console.log('[ERROR] gulp make task failed', err);
        console.log('[FAIL] gulp make task failed - exiting with code ' + exitCode);
        return process.exit(exitCode);
      });
    }
    else {
      runSequence('clean', ['markup', 'scripts', 'styles', 'media', 'vendor'], function (err) {
        if (!err) return cb();
        
        //if any error happened in the previous tasks, exit with a code > 0
        var exitCode = 3;
        console.log('[ERROR] gulp make task failed', err);
        console.log('[FAIL] gulp make task failed - exiting with code ' + exitCode);
        return process.exit(exitCode);
      });
    }
});

// Default task
gulp.task('default', function() {
  var gutil = require('gulp-util');
  
  console.log("\nUsage:");
  console.log("----------------");
  console.log(" $ " + gutil.colors.cyan("gulp make") + "          Compiles the app from src/ to www/");
  console.log(" $ " + gutil.colors.cyan("gulp debug") + "         Compile, start the app locally and reload with Nodemon");
  console.log(" $ " + gutil.colors.cyan("gulp po:extract") + "    Generate the translation template (po/template.pot)");
  console.log(" $ " + gutil.colors.cyan("gulp po:compile") + "    Generate the files for each language (po/*.js)");
  console.log("  ");
  console.log(" $ " + gutil.colors.cyan("gulp bower") + "         Downloads the dependencies from bower.json to src/vendor");
  console.log(" $ " + gutil.colors.cyan("gulp readme") + "        Mostra el README.md del projecte en el navegador");
  console.log("  ");
  console.log(" $ " + gutil.colors.cyan("gulp start") + "         Start the server as a daemon (implies gulp make)");
  console.log(" $ " + gutil.colors.cyan("gulp restart") + "       Restart the server (implies gulp make)");
  console.log(" $ " + gutil.colors.cyan("gulp stop") + "          Stop the server");
  console.log("  ");
});

// MAIN TASKS
gulp.task('debug', ['make', 'nodemon'], function () {
  var watch = require('gulp-watch');
  var batch = require('gulp-batch');
  
  livereload.listen({quiet: true});
  
  watch('src/**/*.js', batch(function (events, done) { gulp.start(['jshint', 'javascript'], done); }));
  watch('src/**/*.scss', batch(function (events, done) { gulp.start('scss', done); }));
  watch('src/**/*.css', batch(function (events, done) { gulp.start('scss', done); }));
  watch('src/**/*.jade', batch(function (events, done) { gulp.start('jade', done); }));
  watch('src/**/*.html', batch(function (events, done) { gulp.start('html', done); }));
  watch('src/**/*.{png,jpg,jpeg,tiff,gif,svg,mp4,mp4,ogg}', batch(function (events, done) { gulp.start('media', done); }));

  console.log("gulp > Watching source files for changes...");
});

gulp.task('nodemon', function () {
  var nodemon = require('gulp-nodemon');

  nodemon({ script: 'server.js', ext: 'js', ignore: ['src', 'tools', 'www', 'test', 'node_modules'], nodeArgs: ['--debug']  })
    .on('change', function(){
      console.log('Server has changed, restarting...');
    })
    .on('restart', function () {
      console.log('Server restarted');
    });
});

gulp.task('todo', shell.task([
  'notes *.js models/ controllers/ src/styles/ src/scripts/ src/views/ || echo "You need to install notes by running \'sudo npm install -g notes\' "'
]));

gulp.task('deps', shell.task([
  'npm-dview || echo "You need to install npm-dview by running \'sudo npm install -g npm-dview\' "'
]));

gulp.task('start', ['make'], shell.task([
  'pm2 start server.js 2>/dev/null || node server.js'
]));

gulp.task('restart', ['make'], shell.task([
  'pm2 restart server.js 2>/dev/null || echo "The pm2 command is not installed.\nTo stop the server, just hit Ctrl+C in the terminal where your Node app is running and launch it again" '
]));

gulp.task('stop', shell.task([
  'pm2 stop server.js 2>/dev/null || echo "The pm2 command is not installed.\nTo stop the server, just hit Ctrl+C in the terminal where your Node app is running" '
]));

// gulp.task('test', ['make'], function () {
//   var mocha = require('gulp-mocha');
//   gulp.src('test/index.js')
//       .pipe(mocha({reporter: 'nyan'}));
// });
