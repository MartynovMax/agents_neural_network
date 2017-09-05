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
var bump      = require('gulp-bump');
var args      = require('yargs').argv;
var fs        = require('fs');
var replace   = require('gulp-replace');
// var git       = require('gulp-git');



var PORT  = '8888';
var PATHS = {
  INDEX: './index.html',
  PACKAGES_CONFIGS: [
    './package.json'
  ],
  APP: [
    './app/helpers.js',
    './app/app.js',
  ],
  JS: [
    '!./app/vendor/*',
    '!./app/vendor/*/*',
    './app/*.js',
    './app/*/*.js',
    './app/*/*/*.js',
    './classes/main.js',
  ],
  CSS: [
    './app/*.css',
    './app/*/*.css',
    './app/*/*/*.css',
  ],
  DEPENDENCIES: {
    JS: [
      'node_modules/lodash/lodash.js',
      'node_modules/svg.js/dist/svg.min.js',
      'node_modules/svg.draggable.js/dist/svg.draggable.min.js',
      'node_modules/svg.path.js/svg.path.min.js',
      'node_modules/svg.select.js/dist/svg.select.min.js',
      'node_modules/svg.resize.js/dist/svg.resize.min.js',
      'node_modules/svg.easing.js/dist/svg.easing.min.js',
      'node_modules/svg-pan-zoom/dist/svg-pan-zoom.min.js',
      'node_modules/save-svg-as-png/saveSvgAsPng.js',
      'node_modules/synaptic/dist/synaptic.js',
      'app/vendor/svg.math.js/svg.math.min.js',
      'app/vendor/svg.foreignobject.js/svg.foreignobject.js',
      'app/vendor/line-circle-collision/index.js',
      'app/vendor/requirejs/require.js',
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
gulp.task('bump'   , task_bump);
gulp.task('bundle' , task_bundle);
gulp.task('build'  , ['bump', 'bundle']);

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





function task_bundle() {
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



function getPackageJson() {
  return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
}


function task_bump() {
    /// <summary>
    /// It bumps revisions
    /// Usage:
    /// 1. gulp bump : bumps the package.json and bower.json to the next minor revision.
    ///   i.e. from 0.1.1 to 0.1.2
    /// 2. gulp bump --version 1.1.1 : bumps/sets the package.json and bower.json to the 
    ///    specified revision.
    /// 3. gulp bump --type major       : bumps 1.0.0 
    ///    gulp bump --type minor       : bumps 0.1.0
    ///    gulp bump --type patch       : bumps 0.0.2
    ///    gulp bump --type prerelease  : bumps 0.0.1-2
    /// </summary>

    var type    = args.type;
    var version = args.version;
    var options = {};
    
    if (version) {
      options.version = version;
    } else {
      options.type = type;
    }

    return gulp
      .src(PATHS.PACKAGES_CONFIGS)
      .pipe(bump(options))
      .pipe(gulp.dest('./'))
      .on('end', function() {
        var pkg = getPackageJson();
        setVersionAngularApp(pkg.version);

        git.tag('v' + pkg.version, '', function (err) {
          if (err) throw err;
        });

        setTimeout(function(){
          console.log('App version: ' + pkg.version);
        });
      });
}



function setVersionAngularApp(version){
  if (!version) return undefined;

  gulp.src([PATHS.ANGULAR_APP])
    .pipe(
      replace(
        /constant\(\s{0,}\'APP_VERSION\'\,\s{0,}.+\)/, 
        "constant('APP_VERSION', '" + version + "')"
      )
    )
    .pipe(gulp.dest('./app'));
}

