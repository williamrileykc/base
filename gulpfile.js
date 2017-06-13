//---------------------------------------------------------------------------------------------
// Packages
//---------------------------------------------------------------------------------------------
var gulp            = require('gulp'),
sass                = require('gulp-sass'),
csscomb             = require('gulp-csscomb'),
cleancss            = require('gulp-clean-css'),
autoprefixer        = require('gulp-autoprefixer'),
htmlhint            = require('gulp-htmlhint'),
jshint              = require('gulp-jshint'),
modernizr           = require('gulp-modernizr'),
uglify              = require('gulp-uglify'),
filesize            = require('gulp-filesize'),
rename              = require('gulp-rename'),
plumber             = require('gulp-plumber'),
spritesmith         = require('gulp.spritesmith'),
runSequence         = require('run-sequence'),
gulpif              = require('gulp-if'),
concat              = require('gulp-concat'),
imagemin            = require('gulp-imagemin'),
pngquant            = require('imagemin-pngquant'),
notify              = require('gulp-notify'),
livereload          = require('gulp-livereload');

var onError = function (err) {
    gutil.beep();
    console.log(err);
};

//---------------------------------------------------------------------------------------------
// Set the production Paths
//---------------------------------------------------------------------------------------------
var base_src = 'templates/src/';
var base_dest = 'web/theme/';

var paths = {
    // Array of Javascript files to concatenate and minify
    js_concat   : [
        base_src + 'vendor/fancyBox/source/jquery.fancybox.pack.js',
        base_src + 'vendor/fancyBox/source/helpers/jquery.fancybox-media.js',
        base_src + 'vendor/jquery.hoverscroll-0.2.4/jquery.hoverscroll.js',
        base_src + 'vendor/imagesloaded/imagesloaded.pkgd.js',
        base_src + 'vendor/enquire/dist/enquire.js',
        base_src + 'vendor/slick-carousel/slick/slick.min.js',
        base_src + 'vendor/vide/dist/jquery.vide.min.js',
        base_src + 'js/scripts.js'
    ],
    // Array of Javascript files to move as-is. Will not concatenate or minify
    js_copy : [
        base_src + 'vendor/jquery/dist/jquery.min.js',
        base_src + 'scripts/modernizr.js'        
    ],
    js   : {
        watch: base_src + 'scripts/**/*.js',
        js_dest: base_dest + 'js/',
        js_filename: 'scripts.js'
    },    
    sass   : {
        watch: base_src + 'scss/**/*.scss',
        sass_src: base_src + 'scss/styles.scss'
    },
    css    : base_dest + 'css/',
    images: {
        images_src: base_src + 'media/images/**/*',
        dest: base_dest + 'media/images/'
    },
    sprites: {
        sprites_src        : base_src + 'media/sprites/',
        sprites_filename   : 'sprites.png',
        sprites_sasspath   : base_src + 'scss/partials',
        sprites_sassfile   : '_sprites.scss',
        sprites_csspath    : base_dest + 'media/images/',
        sprites_spritefile : base_dest + 'media/images/',
    },
    fonts: {
        src: base_src + 'media/fonts/**/*',
        dest: base_dest + 'media/fonts'
    },
    clean  : [
        base_dest + 'css',
        base_dest + 'js',
        base_dest + 'media/images',
        base_dest + 'media/fonts',
    ],
}


//---------------------------------------------------------------------------------------------
// TASK: Modernizr
//---------------------------------------------------------------------------------------------

gulp.task('modernizr', function() {
  gulp.src(base_src + 'js/scripts.js')
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
    return gulp.src(paths.sass.sass_src)
        .pipe(plumber())
        .pipe(sass({ style: 'expanded', /* require: 'susy', */}).on('error', sass.logError).on('error', onError))
        .pipe(autoprefixer({browsers: ['last 2 version','ie 10']}))
        .pipe(csscomb())
        .pipe(gulp.dest(paths.css))
        .pipe(filesize())
        .pipe(rename({ suffix: '.min' }))
        .pipe(cleancss())
        .pipe(gulp.dest(paths.css))
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

    gulp.src(paths.js_copy)
        .pipe(plumber())
        .pipe(gulp.dest(paths.js.js_dest))
        .pipe(filesize())
        .pipe(notify({ message: 'Scripts copy task complete.' }));


    return gulp.src(paths.js_concat)
        .pipe(plumber())
        .pipe(concat(paths.js.js_filename))
        .pipe(gulp.dest(paths.js.js_dest))
        .pipe(filesize())
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest(paths.js.js_dest))
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
// TASK: Sprite
//---------------------------------------------------------------------------------------------
gulp.task('sprite', function () {
  // Generate our spritesheet
  var spriteData = gulp.src(paths.sprites_src + '/**/*.png').pipe(spritesmith({
    imgName: paths.sprites_filename,
    cssName: paths.sprites_sassfile,
    imgPath: paths.sprites_csspath + paths.sprites_filename
  }));

  // Pipe image stream through image optimizer and onto disk
  spriteData.img
    .pipe(gulp.dest(paths.sprites_spritefile));

  // Pipe CSS stream through CSS optimizer and onto disk
  spriteData.css
    .pipe(gulp.dest(paths.sprites_sasspath));
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
  return gulp.src(paths.clean, { read: false }) // much faster
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
    // gulp.watch('htdocs/sites/all/themes/custom/washington/css/styles.min.css', function(event) {
    //     console.log('File ' + event.path + ' was ' + event.type + ', reload...')
    //     livereload.changed('/sites/all/themes/custom/washington/css/styles.min.css');
    // });

    // gulp.watch('htdocs/sites/all/themes/custom/washington/css/styles.css', function(event) {
    //     console.log('File ' + event.path + ' was ' + event.type + ', reload...')
    //     livereload.changed('/sites/all/themes/custom/washington/css/styles.css');
    // });

    // Watch .scss files
    gulp.watch(paths.sass.watch, function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...')
        gulp.start('styles');
    });

    // Watch .js files
    gulp.watch(base_src + 'js/**/*.js', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...')
        gulp.start('jshint', 'scripts');
    });

    // // Watch .html files
    // gulp.watch('templates/**/*.html', function(event) {
    //     console.log('File ' + event.path + ' was ' + event.type + ', running tasks...')
    //     gulp.start('validate');
    // });

});




