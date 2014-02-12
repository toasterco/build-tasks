module.exports = function (grunt) {
	'use strict';

    // Load the all the plugins that Grunt requires
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            name: '',
            version: '0.1.0',
            homepage: '', // project website
            author: 'Toaster Ltd',
            licence: 'Licensed MIT'
        },
        // File locations
        baseDir: 'test/',
        srcDir: '<%= baseDir %>src/',
        jsDir: '<%= srcDir %>js/',
        cssDir: '<%= srcDir %>css/',
        jsFilename: 'main',
        cssFilename: 'styles',

        banner: '/*! <%= meta.name %> - v<%= meta.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '* <%= meta.homepage %>\n' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
            '<%= meta.author %>; <%= meta.licence %> */\n',


        // Task configurations
        sass: {
            options: {
                banner: '<%= banner %>',
                noCache: true
            },
            development: {
                options: {
                    style: 'expanded',
                    trace: true
                },
                files: {
                    '<%= cssDir %><%= cssFilename %>.css': '<%= cssDir %>sass/main.scss'
                }
            },
            production: {
                options: {
                    style: 'compressed',
                    trace: false
                },
                files: {
                    '<%= cssDir %><%= cssFilename %>.css': '<%= cssDir %>sass/main.scss'
                }
            }
        },
        closureCompiler:  {
            options: {
                compilerFile: '<%= jsDir %>lib/compiler.jar',

                // Set to true if you want to check if files were modified
                // before starting compilation (can save some time in large sourcebases)
                checkModified: false,

                compile: false,

                // output_mode: 'compiled',

                compilerOpts: {

                    // Keys will be used as directives for the compiler
                    // values can be strings or arrays.
                    // If no value is required use null
                    //
                    // The directive 'externs' is treated as a special case
                    // allowing a grunt file syntax (<config:...>, *)

                    compilation_level: 'SIMPLE_OPTIMIZATIONS',
                    // compilation_level: 'ADVANCED_OPTIMIZATIONS',
                    externs: [
                        '<%= jsDir %>lib/externs.js'
                    ],
                    manage_closure_dependencies: true,
                    define: ["'goog.DEBUG=false'"],
                    warning_level: 'verbose',
                    // jscomp_off: ['checkTypes', 'fileoverviewTags'],
                    // formatting: "pretty_print",
                    summary_detail_level: 3,
                    // output_wrapper: '"(function(){%output%}).call(this);"',
                    debug: true,
                    create_source_map: false
                },
                // Set exec method options
                execOpts: {
                    /**
                    * Set maxBuffer if you got message "Error: maxBuffer exceeded."
                    * Node default: 200*1024
                    */
                    maxBuffer: 999999 * 1024
                }

            },
            production: {

                /**
                * [OPTIONAL] Here you can add new or override previous option of the Closure Compiler Directives.
                * IMPORTANT! The feature is enabled as a temporary solution to [#738](https://github.com/gruntjs/grunt/issues/738).
                * As soon as issue will be fixed this feature will be removed.
                */
                TEMPcompilerOpts: {

                },

                // Target files to compile. Can be a string, an array of strings
                // or grunt file syntax (<config:...>, *)
                src: [
                    // "<%= jsDir %>lib/closure",
                    "<%= jsDir %>app/*.js",
                    "<%= jsDir %>lib/closure/closure/goog/base.js",
                    // "<%= jsDir %>app/app.js"
                ],

                // [OPTIONAL] set an output file
                dest: '<%= jsDir %>app.min.js'
            }
        },
        closureBuilder: {
            options: {
                // [REQUIRED] To find the builder executable we need either the path to
                //    closure library or directly the filepath to the builder:
                closureLibraryPath: '<%= jsDir %>lib/closure', // path to closure library

                // [OPTIONAL] You can define an alternative path of the builder.
                //    If set it trumps 'closureLibraryPath' which will not be required.
                // builder: '<%= jsDir %>lib/closure/closure/bin/build/closurebuilder.py',

                // [REQUIRED] One of the two following options is required:
                // inputs: 'string|Array', // input files (can just be the entry point)
                namespaces: [
                    'pw.app.Application',
                    'goog.dom',
                    'goog.dom.classlist',
                    'goog.dom.query',
                    'goog.dom.forms',
                    'goog.dom.fullscreen',
                    'goog.events',
                    'goog.events.EventType',
                    "goog.net.XhrIo",
                    "goog.structs.Map",
                    "goog.Uri.QueryData",
                    'goog.style',
                    'goog.array',
                    'goog.object',
                    'goog.pubsub.PubSub',
                    'goog.userAgent',
                    'goog.userAgent.product',
                    'pw.app.Gallery',
                    'pw.app.CharacterLimit',
                    'pw.app.Carousel',
                    'pw.app.Fullscreen',
                    'pw.app.GalleryActions',
                    'pw.app.InfiniteScroll',
                    'pw.app.Lightbox',
                    'pw.app.Loader',
                    'pw.app.QuoteHopper',
                    'pw.app.QuoteEngine',
                    'pw.app.SharePager',
                    'pw.app.NewEventForm',
                    'pw.app.FeedbackForm',
                    'pw.app.Map',
                ],

                // [OPTIONAL] The location of the compiler.jar
                // This is required if you set the option "compile" to true.
                compilerFile: '<%= jsDir %>lib/compiler.jar',

                // [OPTIONAL] output_mode can be 'list', 'script' or 'compiled'.
                //    If compile is set to true, 'compiled' mode is enforced.
                //    Default is 'script'.
                // output_mode: 'compiled',

                // [OPTIONAL] if we want builder to perform compile
                compile: true, // boolean

                compilerOpts: {
                    compilation_level: 'SIMPLE_OPTIMIZATIONS',
                    // compilation_level: 'ADVANCED_OPTIMIZATIONS',
                    externs: [
                        '<%= jsDir %>lib/externs.js'
                    ],
                    manage_closure_dependencies: true,
                    define: ["'goog.DEBUG=false'"],
                    warning_level: 'verbose',
                    // jscomp_off: ['checkTypes', 'fileoverviewTags'],
                    // formatting: "pretty_print",
                    summary_detail_level: 3,
                    // output_wrapper: '"(function(){%output%}).call(this);"',
                    debug: true,
                },
                // [OPTIONAL] Set exec method options
                execOpts: {
                    /**
                    * Set maxBuffer if you got message "Error: maxBuffer exceeded."
                    * Node default: 200*1024
                    */
                    maxBuffer: 999999 * 1024
                }

            },

            // any name that describes your operation
            production: {

                // [REQUIRED] paths to be traversed to build the dependencies
                src: [
                    "<%= jsDir %>lib/closure",
                    "<%= jsDir %>app"
                ],

                // [OPTIONAL] if not set, will output to stdout
                dest: '<%= jsDir %>app.min.js'
            }
        },
        watch: {
            options: { nospawn: true },
            env: {
                // environment files, markup pages, etc.
                files: [
                    "<%= srcDir %>*.html"
                ],
                options: { livereload: true },
                tasks: []
            },
            sass: {
                files: [
                    '<%= cssDir %>/sass/**/*.scss'
                ],
                options: { livereload: true },
                tasks: [
                    // 'notify:sass',
                    'sass:development'
                ]
            }
        }
    });

    // just run `grunt` when developing locally
    grunt.registerTask('default', [
        'watch'
    ]);

    grunt.registerTask('compile', [
        'closureCompiler'
    ]);

    // prep files for production
    grunt.registerTask('build', [
        'closureBuilder'
        // 'sass:production' // un-comment this when closure stuff is sorted
    ]);

};
