var gulp      = require('gulp');
var rename    = require('gulp-rename');
var inject    = require('gulp-inject');
var connect   = require('gulp-connect');
var opn       = require('opn');
var del       = require('del');
var concat    = require('gulp-concat');
var uglify    = require('gulp-uglify');
var size      = require('gulp-size');
var minifyCSS = require('gulp-minify-css');


var PORT  = '8888';
var PATHS = {
  INDEX: './index.html',
  APP: [
    './components/helpers.js',
    './components/app.js',
  ],
  JS: [
    '!./components/vendor/*',
    '!./components/vendor/*/*',
    './components/*.js',
    './components/*/*.js',
    './components/*/*/*.js',
  ],
  CLASSES: [
    './components/classes/*.js',
    './components/classes/*/*.js',
  ],
  CSS: [
    './components/*.css',
    './components/*/*.css',
    './components/*/*/*.css',
  ],
  DEPENDENCIES: {
    JS: [
      'node_modules/svg.js/dist/svg.min.js',
      'node_modules/svg.draggable.js/dist/svg.draggable.min.js',
      'node_modules/svg.path.js/svg.path.min.js',
      'node_modules/svg.select.js/dist/svg.select.min.js',
      'node_modules/svg.resize.js/dist/svg.resize.min.js',
      'node_modules/svg.easing.js/dist/svg.easing.min.js',
      'node_modules/svg-pan-zoom/dist/svg-pan-zoom.min.js',
      'node_modules/save-svg-as-png/saveSvgAsPng.js',
      'node_modules/synaptic/dist/synaptic.js',
      'components/vendor/svg.math.js/svg.math.min.js',
      'components/vendor/svg.foreignobject.js/svg.foreignobject.js',
      'components/vendor/line-circle-collision/index.js',
    ],
    CSS: [
      'node_modules/svg.select.js/dist/svg.min.css',
    ]
  },
  BUILD: 'dist'  
};



var DEFAULT_TASKS = ['inject', 'connect', 'watch'];

gulp.task('default', DEFAULT_TASKS);
gulp.task('serve'  , DEFAULT_TASKS);
gulp.task('start'  , DEFAULT_TASKS);
gulp.task('build'  , task_build);

// launch local server
gulp.task('connect', task_connect);
gulp.task('watch', task_watch);
gulp.task('reload_html', task_reload_html) 
gulp.task('reload_app', task_reload_app);
gulp.task('reload_css', task_reload_css);
gulp.task('reload_js', task_reload_js);
gulp.task('inject', task_inject);



/*
* ===================================
* ===================================
*/






function task_connect() {
  setTimeout(function() {
    connect.server({
      root      : __dirname,
      livereload: true,
      port      : PORT
    });

    opn('http://localhost:' + PORT);
  }, 1000);
};




function task_watch() {
  gulp.watch(PATHS.INDEX, ['reload_html']);
  gulp.watch(PATHS.APP  , ['reload_app']);
  gulp.watch(PATHS.CSS  , ['reload_css']);
  gulp.watch(PATHS.JS   , ['reload_js']);
};


function task_reload_html() {
  gulp.src(PATHS.INDEX)
    .pipe(connect.reload());
};


function task_reload_app() {
  gulp.src(PATHS.APP)
    .pipe(connect.reload());
};


function task_reload_css() {
  gulp.src(PATHS.CSS)
    .pipe(connect.reload());
};


function task_reload_js() {
  gulp.src(PATHS.JS)
    .pipe(connect.reload());
};






function task_inject() {
  var target = gulp.src(PATHS.INDEX);

  // app
  target.pipe(
    inject(
      gulp.src(PATHS.APP, {read: false})
      ,{
        name: 'app',
        addRootSlash: false,
      }))
    .pipe(gulp.dest('./'));

  // js components 
  target.pipe(
    inject(
      gulp.src(PATHS.JS, {read: false})
      ,{
        name: 'components',
        addRootSlash: false,
      }))
    .pipe(gulp.dest('./'));


  // css components 
  target.pipe(
    inject(
      gulp.src(PATHS.CSS, {read: false})
      ,{
        name: 'styles',
        addRootSlash: false,
      }))
    .pipe(gulp.dest('./'));


  // js dependencies 
  target.pipe(
    inject(
      gulp.src(PATHS.DEPENDENCIES.JS, {read: false})
      ,{
        name: 'dependencies-js',
        addRootSlash: false,
      }))
    .pipe(gulp.dest('./'));


  // css dependencies 
  target.pipe(
    inject(
      gulp.src(PATHS.DEPENDENCIES.CSS, {read: false})
      ,{
        name: 'dependencies-css',
        addRootSlash: false,
      }))
    .pipe(gulp.dest('./'));
};





function task_build() {
  var NAME_FILE_APP_JS           = 'app.temp.js';
  var NAME_FILE_APP_CSS          = 'app.temp.css';
  var NAME_FILE_DEPENDENCIES_JS  = 'dependencies.temp.js';
  var NAME_FILE_DEPENDENCIES_CSS = 'dependencies.temp.css';
  var NAME_FILE_RESULT_JS        = 'app.min.js';
  var NAME_FILE_RESULT_CSS       = 'app.min.css';

  // JS
  // dependencied
  gulp.src(PATHS.DEPENDENCIES.JS)
    .pipe(concat(NAME_FILE_DEPENDENCIES_JS))
    .pipe(uglify({
      mangle: false
    }))
    .pipe(gulp.dest(PATHS.BUILD))
    .on('end', function(){
            
      // app
      gulp.src(PATHS.JS)
        .pipe(concat(NAME_FILE_APP_JS))
        .pipe(uglify({
          mangle: false
        }))
        .pipe(gulp.dest(PATHS.BUILD))
        .on('end', function(){

          // result js file
          var resultFiles = [
            PATHS.BUILD + '/' + NAME_FILE_DEPENDENCIES_JS,
            PATHS.BUILD + '/' + NAME_FILE_APP_JS,
          ];

          gulp.src(resultFiles)
            .pipe(concat(NAME_FILE_RESULT_JS))
            .pipe(size({
              title: 'size result JS file'
            }))
            .pipe(gulp.dest(PATHS.BUILD))
            .on('end', function() {
              del(resultFiles);
            });
        });
    });
    

  // CSS  
  // dependencied
  gulp.src(PATHS.DEPENDENCIES.CSS)
    .pipe(concat(NAME_FILE_DEPENDENCIES_CSS))
    .pipe(minifyCSS({
      keepBreaks: false
    }))
    .pipe(gulp.dest(PATHS.BUILD))
    .on('end', function(){

      // app
      gulp.src(PATHS.CSS)
        .pipe(concat(NAME_FILE_APP_CSS))
        .pipe(minifyCSS({
          keepBreaks: false
        }))
        .pipe(gulp.dest(PATHS.BUILD))
        .on('end', function(){

          // result css file
          var resultFiles = [
            PATHS.BUILD + '/' + NAME_FILE_DEPENDENCIES_CSS,
            PATHS.BUILD + '/' + NAME_FILE_APP_CSS,
          ];

          gulp.src(resultFiles)
            .pipe(concat(NAME_FILE_RESULT_CSS))
            .pipe(size({
              title: 'size result CSS file'
            }))
            .pipe(gulp.dest(PATHS.BUILD))
            .on('end', function() {
              del(resultFiles);
            });
        });

    });

}



