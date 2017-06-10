//---------------------------------------------------------------------------------------------
// Set the production Paths
//---------------------------------------------------------------------------------------------

var styles_src  = 'templates/src/scss/*.scss'; // Location to source your scss files from. Usually a specific file, but you can use **/*.scss wildcard
var styles_dest = 'htdocs/sites/all/themes/custom/washington/css/'; // Destination to send your compiled CSS. Will also send a production ready minified css file to this directory

// Array of Javascript files to concatenate and minify
var js_concat = [
	'templates/src/vendor/fancyBox/source/jquery.fancybox.pack.js',
    'templates/src/vendor/fancyBox/source/helpers/jquery.fancybox-media.js',
    'templates/src/vendor/sticky-kit/jquery.sticky-kit.js',
    'templates/src/vendor/jquery.hoverscroll-0.2.4/jquery.hoverscroll.js',
    'templates/src/vendor/masonry/dist/masonry.pkgd.js',
    'templates/src/vendor/imagesloaded/imagesloaded.pkgd.js',
    'templates/src/vendor/footable/js/footable.js',
    'templates/src/vendor/rrssb/js/rrssb.js',
    'templates/src/vendor/enquire/dist/enquire.js',
    'templates/src/vendor/aRes/aresWidget.js',
    'templates/src/vendor/infobox/infobox.js',
    'templates/src/vendor/tooltipster/js/jquery.tooltipster.js',
    'templates/src/vendor/slick-carousel/slick/slick.min.js',
    'templates/src/vendor/vide/dist/jquery.vide.min.js',
    'templates/src/js/scripts.js',
];

var js_dest     = 'htdocs/sites/all/themes/custom/washington/js'; // Destination to send your compiled JS scripts to. Will also send a production ready minified css file to this directory
var js_filename = 'scripts.js';
var js_modernizr= 'templates/src/js/';

// Array of Javascript files to move as-is. Will not concatenate or minify
var js_src = [
    'templates/src/vendor/jquery/dist/jquery.min.js',
    'templates/src/js/modernizr.js'
];

// Array of in-house JS code to jshint
var js_hint = [
    'templates/src/js/scripts.js'
];

// Array of directories (and those to skip) to validate HTML
var validate_src = 'htdocs/templates/**/*.html';

// Array of directories and font files to copy to production assets
var fonts_src = [
    'templates/src/media/fonts/**/*',
];
var fonts_dest = 'htdocs/sites/all/themes/custom/washington/media/fonts'; // Destination to send your font files

var img_src     = 'templates/src/media/images/**/*'; // Directory to copy all images from. This will grab all file extensions.
var img_dest    = 'htdocs/sites/all/themes/custom/washington/media/images'; // Destination to send all images to.

// Directories to wipe out. Be careful. Everything in these directories will be deleted.
var clean_dir = [
    'htdocs/sites/all/themes/custom/washington/css',
    'htdocs/sites/all/themes/custom/washington/js',
    'htdocs/sites/all/themes/custom/washington/media/images',
    'htdocs/sites/all/themes/custom/washington/media/fonts',
];

//---------------------------------------------------------------------------------------------
// Load the dependencies
//---------------------------------------------------------------------------------------------

var gulp            = require('gulp'),
    sass            = require('gulp-sass'),
    autoprefixer    = require('gulp-autoprefixer'),
    csscomb         = require('gulp-csscomb'),
    cleancss        = require('gulp-clean-css'),
    htmlhint        = require("gulp-htmlhint"),
    uglify          = require('gulp-uglify'),
    imagemin        = require('gulp-imagemin'),
    rename          = require('gulp-rename'),
    rimraf          = require('gulp-rimraf'),
    concat          = require('gulp-concat'),
    notify          = require('gulp-notify'),
    plumber         = require('gulp-plumber'),
    gutil           = require('gulp-util'),
    runSequence     = require('run-sequence'),
    pngquant        = require('imagemin-pngquant'),
    gulpif          = require('gulp-if'),
    filesize        = require('gulp-filesize'),
    modernizr       = require('gulp-modernizr'),
    jshint          = require('gulp-jshint'),
    stylish         = require('jshint-stylish'),
    livereload      = require('gulp-livereload');

var onError = function (err) {
  gutil.beep();
  console.log(err);
};

//---------------------------------------------------------------------------------------------
// TASK: Modernizr
//---------------------------------------------------------------------------------------------

gulp.task('modernizr', function() {
  gulp.src('templates/src/js/scripts.js')
    .pipe(modernizr({

    // Based on default settings on http://modernizr.com/download/
    "options" : [
        "setClasses",
        "addTest",
        "html5printshiv",
        "testProp",
        "fnBind"
    ],
    // Define any tests you want to explicitly include
    "tests" : [
        //"hiddenscroll",
        "ie8compat",
        "ligatures",
        "svg",
        "backgroundblendmode",
        "backgroundcliptext",
        "backgroundsizecover",
        "flexbox",
        "flexboxlegacy",
        "flexboxtweener",
        "lastchild",
        "objectfit",
        "vhunit",
        "vwunit"
    ]
    }))
    .pipe(uglify())
    .pipe(gulp.dest(js_modernizr))
});

//---------------------------------------------------------------------------------------------
// TASK: Styles
//---------------------------------------------------------------------------------------------

 gulp.task('styles', function () {
    return gulp.src(styles_src)
        .pipe(plumber())
        .pipe(sass({ style: 'expanded', require: 'susy',}).on('error', sass.logError).on('error', onError))
        .pipe(autoprefixer({browsers: ['last 2 version','ie 10']}))
        .pipe(csscomb())
        .pipe(gulp.dest(styles_dest))
        .pipe(filesize())
        .pipe(rename({ suffix: '.min' }))
        .pipe(cleancss())
        .pipe(gulp.dest(styles_dest))
        .pipe(filesize())
        .pipe(notify({ message: 'Styles task complete' }));
});

//---------------------------------------------------------------------------------------------
// TASK: jshint
//---------------------------------------------------------------------------------------------

gulp.task('jshint', function() {
    gulp.src(js_hint)
        .pipe(plumber())
        .pipe(jshint()) // Walz semicolon detection bot
        .pipe(jshint.reporter(stylish));
});

//---------------------------------------------------------------------------------------------
// TASK: scripts
//---------------------------------------------------------------------------------------------

gulp.task('scripts', function() {

    gulp.src(js_src)
        .pipe(plumber())
        .pipe(gulp.dest(js_dest))
        .pipe(filesize())
        .pipe(notify({ message: 'Scripts copy task complete.' }));


    return gulp.src(js_concat)
        .pipe(plumber())
        .pipe(concat(js_filename))
        .pipe(gulp.dest(js_dest))
        .pipe(filesize())
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest(js_dest))
        .pipe(filesize())
        .pipe(notify({ message: 'Scripts concat task complete.' }));
});

//---------------------------------------------------------------------------------------------
// TASK: fonts
//---------------------------------------------------------------------------------------------
gulp.task('fonts', function() {

    return gulp.src(fonts_src)
        .pipe(gulp.dest(fonts_dest))
        .pipe(notify({ message: 'Fonts task complete.' }))
        .pipe(filesize());
});

//---------------------------------------------------------------------------------------------
// TASK: Images
//---------------------------------------------------------------------------------------------

gulp.task('images', function () {
    return gulp.src(img_src)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant({speed: 7})]
        }))
        .pipe(gulp.dest(img_dest))
        .pipe(filesize());
});

//---------------------------------------------------------------------------------------------
// TASK: Validate
//---------------------------------------------------------------------------------------------

gulp.task('validate', function() {

  return gulp.src(validate_src)
    .pipe(htmlhint())
    .pipe(htmlhint.reporter())
});

//---------------------------------------------------------------------------------------------
// TASK: Clean
//---------------------------------------------------------------------------------------------

gulp.task('clean', function() {
  return gulp.src(clean_dir, { read: false }) // much faster
    .pipe(rimraf({ force: true }))
    .pipe(notify({ message: 'Clean task complete.' }));
});

//---------------------------------------------------------------------------------------------
// BUILD TASK: Run `gulp build`
// This is the build task, It will clean out all of the specified directories (except not
// anymore), compile and minify your sass, concatencate and minify your scripts, move
// necessary fonts, and compress and move images to the assets directory.
//---------------------------------------------------------------------------------------------

gulp.task('build', function() {
    runSequence(['styles', 'jshint', 'scripts', 'fonts', 'images', 'validate']);
});

//---------------------------------------------------------------------------------------------
// BUILD TASK: Run `gulp buildprod`
// This is the build task, It will clean out all of the specified directories (except not
// anymore), compile and minify your sass, concatencate and minify your scripts, move
// necessary fonts, and compress and move images to the assets directory.
//---------------------------------------------------------------------------------------------

gulp.task('prod', function() {
    runSequence('clean', ['styles', 'jshint', 'scripts', 'fonts', 'images', 'validate']);
});

//---------------------------------------------------------------------------------------------
// DEVELOPMENT/WATCH TASK: Run `gulp`
// This is the development task. It is the task you will primarily use. It will watch
// for changes in your sass files, and recompile new CSS when it sees changes. It
// will do the same for javascript files as well.
//---------------------------------------------------------------------------------------------

gulp.task('default', function() {
    livereload.listen();

    // Watch .css files
    gulp.watch('htdocs/sites/all/themes/custom/washington/css/styles.min.css', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', reload...')
        livereload.changed('/sites/all/themes/custom/washington/css/styles.min.css');
    });

    // gulp.watch('htdocs/sites/all/themes/custom/washington/css/styles.css', function(event) {
    //     console.log('File ' + event.path + ' was ' + event.type + ', reload...')
    //     livereload.changed('/sites/all/themes/custom/washington/css/styles.css');
    // });

    // Watch .scss files
    gulp.watch('templates/src/**/*.scss', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...')
        gulp.start('styles');
    });

    // Watch .js files
    gulp.watch('templates/src/js/**/*.js', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...')
        gulp.start('jshint', 'scripts');
    });

    // Watch .html files
    gulp.watch('templates/**/*.html', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...')
        gulp.start('validate');
    });

});
