module.exports = function (grunt) {
	'use strict';

    // Load the all the plugins that Grunt requires
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Project-specific meta
        meta: {
            name: 'Test Project',
            version: '0.1.0',
            homepage: 'http://toasterltd.com',
            author: 'Toaster Ltd', // Should seldom change
            licence: 'Licensed MIT'
        },

        // File locations
        baseDir: 'test/',
        srcDir: '<%= baseDir %>',
        jsDir: '<%= baseDir %>js/',
        cssDir: '<%= baseDir %>css/',
        jsFilename: 'main',
        cssFilename: 'styles',

        banner: '/*! <%= meta.name %> - v<%= meta.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '* <%= meta.homepage %>\n' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
            '<%= meta.author %>; <%= meta.licence %> */\n',


        // Task configuration
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
        concat: {
            options: {
                banner: '<%= banner %>',
                footer: '',
                stripBanners: true, // remove previous banner before concating
                separator: ';' // safetly for minification
            },
            production: {
                src: [
                    '<%= jsDir %>*.js'
                ],
                dest: '<%= jsDir %><%= jsFilename %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>',
                compress: true,
                preserveComments: false,
                mangle: false,
                beautify: false,
                report: 'min'
            },
            production: {
                src: '<%= concat.production.dest %>',
                dest: '<%= jsDir %>main.min.js'
            }
        },
        jshint: {
            // TODO
            // Configure as needed
            options: {
                node: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                browser: true,
                globals: {}
            },
            gruntfile: {
                src: 'gruntfile.js'
            }
        },
        watch: {
            options: { nospawn: true },
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: [
                    'jshint:gruntfile'
                ]
            },
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

    // prep files for production
    grunt.registerTask('build', [
        'jshint',
        'concat:production',
        'uglify:production',
        'sass:production'
    ]);

};
