var deploy = function(sourceFolder, remoteURL, message) {

    // To run this script, just cd to its container directory and
    // node deploy.js
    // (and maybe do a `npm install` first, to satisfy dependencies)

    // Node JS Requirements
    var fs = require('fs');
    var exec = require('child_process').exec;
    var sys = require('sys');
    var path = require('path');
    var output = require('./output');


    // Console Colors
    var cc = {
        blinkSlow: '\x1b[5m',
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        darkRed: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        reset: '\x1b[0m',
        invert: '\x1b[7m',
        bold: '\x1b[1m'
    };


    /**
     * Title
     * @param {String} title
     */
    function title(title){
        var s = cc.white+cc.bold+'--- '+title.toUpperCase() + ' ';
        while(s.length < 90){
            s += '-';
        }
        console.log(s+cc.reset);
    }

    /**
     * Start
     * @param {String} task
     */
    function start(task){
        console.log(cc.cyan+'  '+task + cc.reset+' ...');
    }

    /**
     * Complete
     * @param {String} task
     */
    function complete(task){
        console.log('✓ '+cc.green+task+cc.reset);
    }

    /**
     * Info
     * @param {String} name
     * @param {*} element
     */
    function info(name, element){
        console.log(cc.yellow,name,':',cc.white,element,cc.reset);
    }

    /**
     *
     * @param error
     */
    function error(error){
        if (error){
            console.log(cc.red+cc.bold,'--- ERROR ---');
            console.log(error);
            console.log(cc.reset);
        }
    }
    
    title('Deploy');
    info('sourceFolder',sourceFolder);
    info('remoteURL',remoteURL);
    info('message',message);

    /**
     * Deploy
     * @param {string} dir
     * @param {string} url
     * @param {string} message
     */
    function deploy(dir, url, message) {
        var process = exec('appcfg.py --oauth2 update ' + dir, {}, function(error, stdout, stderr) {
            console.log('');
            console.log(stdout);
            console.log(stderr);
            complete('Deployed');
        });
        process.stdout.on('connection', function (socket) { console.log('connection',socket) });
        process.stdout.on('data', function (data) { console.log('ondata',data) });
        process.stdout.on('close', function (code) { console.log('ondata',code) });
        process.stdout.on('message', function (message) { console.log('message',message) });
        start('Deploying to '+url);
    }

    deploy(sourceFolder, remoteURL, message);
};

exports.deploy = deploy;
