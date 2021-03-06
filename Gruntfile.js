module.exports = function (grunt) {
	'use strict';

    // Config settings
    var config = require('./config');

    var fileBuilder = require('./build');
    var deploy = require('./deploy');

    // Load the all the plugins that Grunt requires
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Console Colors
    var ccYellow = '\x1b[33m';
    var ccWhite = '\x1b[37m';
    var ccReset = '\x1b[0m';
    /**
     * Display Title
     * ASCII art generated from http://patorjk.com/software/taag/#p=testall&f=Isometric1&t=Toaster
     * @param {string} info
     */
    var displayTitle = function(info){
        console.log(ccWhite+'----------------------------------------------------------'+ccReset);
        console.log(ccYellow+'MMP""MM""YMM                         mm                   ');
        console.log('P`   MM   `7                         MM                   ');
        console.log('     MM  ,pW"Wq.   ,6"Yb.  ,pP"Ybd mmMMmm .gP"Ya `7Mb,od8 ');
        console.log('     MM 6W`   `Wb 8)   MM  8I   `"   MM  ,M`   Yb  MM` "` ');
        console.log('     MM 8M     M8  ,pm9MM  `YMMMa.   MM  8M""""""  MM     ');
        console.log('     MM YA.   ,A9 8M   MM  L.   I8   MM  YM.    ,  MM     ');
        console.log('   .JMML.`Ybmd9`  `Moo9^Yo.M9mmmP`   `Mbmo`Mbmmd`.JMML.   '+ccReset);
        console.log(ccWhite+'----------------------------------------------------------'+ccReset);
        console.log( info.toUpperCase() );
        console.log('FULL LOG MODE: '+config.fullBuildLog);
        console.log(ccWhite+'----------------------------------------------------------'+ccReset);
    };

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            name: config.name,
            version: '0.1.0',
            homepage: config.homepage,
            author: config.author,
            licence: config.licence
        },

        // File locations
        baseDir: config.baseDir,
        srcDir: config.src.dir,
        jsDir: config.src.jsDir,
        cssDir: config.src.cssDir,
        imgDir: config.src.imgDir,
        jsFilename: config.src.jsFilename,
        jsExterns: config.jsExterns,
        cssFilename: config.src.cssFilename,

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
            staging: {
                options: {
                    style: 'expanded',
                    trace: true
                },
                files: {
                    '<%= cssDir %><%= cssFilename %>': '<%= cssDir %>sass/main.scss'
                }
            },
            production: {
                options: {
                    style: 'compressed',
                    trace: false
                },
                files: {
                    '<%= cssDir %><%= cssFilename %>': '<%= cssDir %>sass/main.scss'
                }
            }
        },
        closureBuilder: {
            options: {
                closureLibraryPath: '<%= jsDir %>lib/closure', // path to closure library

                // [OPTIONAL] You can define an alternative path of the builder. If set it trumps 'closureLibraryPath' which will not be required.
                // builder: '<%= jsDir %>lib/closure/closure/bin/build/closurebuilder.py',

                // [REQUIRED] One of the two following options is required:
                // inputs: 'string|Array', // input files (can just be the entry point)
                namespaces: config.namespaces,

                // [OPTIONAL] output_mode can be 'list', 'script' or 'compiled'.
                // If compile is set to true, `compiled` mode is enforced and `compilerFile` is REQUIRED
                compile: true,
                output_mode: 'compiled', // script[default]|list|compiled
                compilerFile: '<%= jsDir %>lib/compiler.jar',

                // Compiler flag options
                compilerOpts: {
                    compilation_level: 'ADVANCED_OPTIMIZATIONS',
                    externs: [
                        '<%= jsDir %><%= jsExterns %>'
                    ],
                    warning_level: 'quiet', // verbose|quiet|default
                    summary_detail_level: 0,
                },
                // [OPTIONAL] Set task execution options
                execOpts: {
                    // Set maxBuffer if you got message "Error: maxBuffer exceeded."
                    // Node default: 200*1024
                    maxBuffer: 999999 * 1024
                }
            },
            staging: {
                options: {
                    compilerOpts: {
                        compilation_level: 'SIMPLE_OPTIMIZATIONS',
                        formatting: "pretty_print",
                        define: ["'goog.DEBUG=true'"],
                        debug: true,
                        summary_detail_level: 3,
                    }
                },
                // The paths to be traversed to build the dependencies.
                // These are served as `--root=` options
                src: [
                    "<%= jsDir %>lib/closure",
                    "<%= jsDir %>app"
                ],
                // If not set, will output to stdout
                dest: '<%= jsDir %><%= jsFilename %>'
            },
            production: {
                options: {
                    compilerOpts: {
                        summary_detail_level: 0,
                    }
                },
                src: [
                    "<%= jsDir %>lib/closure",
                    "<%= jsDir %>app"
                ],
                dest: '<%= jsDir %><%= jsFilename %>'
            },
            list: {
                options: {
                    compile: false,
                    output_mode: 'list',
                },
                src: [
                    "<%= jsDir %>lib/closure",
                    "<%= jsDir %>app"
                ],
                dest: '<%= jsDir %>app.manifest'
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
                    'sass:staging'
                ]
            }
        },
        webp: {
            files: {
                expand: true,
                cwd: '<%= imgDir %>',
                src: [
                    '**/*.png',
                    '!webp/',
                ],
                dest: '<%= imgDir %>webp'
            },
            options: {
                binpath: require('webp-bin').path,
                verbose: true,
                lossless: true
                // preset: 'photo',
                // quality: 80,
                // alphaQuality: 80,
                // compressionMethod: 6,
                // segments: 4,
                // psnr: 42,
                // sns: 50,
                // filterStrength: 40,
                // filterSharpness: 3,
                // simpleFilter: true,
                // partitionLimit: 50,
                // analysisPass: 6,
                // multiThreading: true,
                // lowMemory: false,
                // alphaMethod: 0,
                // alphaFilter: 'best',
                // alphaCleanup: true,
                // noAlpha: false,
            }
        }
    });

    grunt.registerTask('fileBuilder', '[custom] Produce build for either staging or production', function(subtask) {
        switch (subtask) {
            case 'staging':
                fileBuilder({
                    version: 'staging',
                    compress: false,
                    public: false
                });
                break;
            case 'production':
                fileBuilder({
                    version: 'production',
                    compress: true,
                    public: false
                });
                break;
            default:
                fileBuilder();
                break;
        }
    });

    grunt.registerTask('encodeImages', '[custom] Recursively encode on or more directories of images to webp', function () {
        grunt.task.run(['webp']);
    });

    grunt.registerTask('default', '[custom] Use for developing locally. Watched files are compiled as changes are made.', [
        'watch'
    ]);

    grunt.registerTask('build', '[custom] Building all the things, either for staging/development [:staging] or production [:production]', function (subtask) {
        subtask = subtask || 'staging';
        displayTitle('BUILDING - '+subtask);
        grunt.task.run([
            'closureBuilder:' + subtask,
            'sass:' + subtask,
            'fileBuilder:' + subtask
        ]);
        // build the manifest file
        if (subtask == 'production') grunt.task.run('closureBuilder:list');
    });

    grunt.registerTask('deploy', "[custom] Deploy to App Engine, specifying either [:staging] or [:production]", function (subtask) {
        subtask = subtask || 'staging';
        displayTitle('DEPLOYING - '+subtask);
        deploy.deploy(path.resolve(config.build.dir, subtask), config.versions[subtask].appengineappid, 'Deploying to ' + subtask);
    });

};
