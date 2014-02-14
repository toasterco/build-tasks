// Node modules
var fs = require('fs'),
    sys = require('sys'),
    path = require('path'),
    htmlMinifier = require('html-minifier'),

    grunt = require('grunt'),
    config = require('./config');

module.exports = main;

// module.exports = main;
// used?
// var exec = require('child_process').exec;
// var cleanCSS = require('clean-css');
// var deploy = require('./deploy');


/**
 * [processHTML description]
 *
 * @param  {[type]} versionKey  [description]
 * @param  {[type]} versionVars [description]
 * @param  {[type]} compressed  [description]
 * @return {[type]}             [description]
 */
function processHTML(versionKey, versionVars, compressed) {

    grunt.log.writeln('Generating HTML...');

    var baseFile = processFile(config.baseTemplateIn, compressed, versionVars.analyticsAccount);

    if (compressed) {
        baseFile = htmlMinifier.minify(baseFile, {
            collapseWhitespace: false,
            removeComments: false
        });
        grunt.log.ok('HTML Minified');
    }

    writeFile(path.resolve(config.buildBaseDir + versionKey + '/' + config.baseTemplateOutFilename), baseFile);
    grunt.log.ok('HTML created in '+ config.buildBaseDir + versionKey + '/' + config.baseTemplateOutFilename);
}

function processFile (file, compressed, analyticsAccount) {

    compressed = compressed || false;

    var fileContents = getFileContents(path.resolve(file)),
        processedTags = processCompressedTags(fileContents, compressed),
        replacedAnalytics = replaceAnalyticsCode(processedTags, analyticsAccount);

    return addFileVersionDate(replacedAnalytics);
};


/**
 * This function removes the <!--UNCOMPRESSED--><!--/UNCOMPRESSED--> tags
 * as required (depending of the value of useCompression)
 */
function processCompressedTags(contents, useCompression) {

    var tag, unusedTag;

    useCompression = useCompression || false;

    if (useCompression) {
        tag = config.tagUncompressed;
        unusedTag = config.tagCompressed;
    } else {
        tag = config.tagCompressed;
        unusedTag = config.tagUncompressed;
    }

    var unusedTxt = tag.open + '(.|\\s)*?' + tag.close,
        unusedBlocksRe = new RegExp(unusedTxt, 'gm'),
        commentsTxt = unusedTag.open +'|' + unusedTag.close,
        commentsRe = new RegExp(commentsTxt, 'g'),
        whitespaceRe = new RegExp('(\\n)+', 'g'),

        output = contents.replace(unusedBlocksRe, '');

    output = output.replace(commentsRe, '');

    // Going even further: remove extra whitespaces if we're in compressed mode
    if (useCompression) {
        output = output.replace(whitespaceRe, '\n');
    }

    return output;
}

function addFileVersionDate(fileContents) {

    // More XML munching
    var now = new Date(),

        timestamp = [
            now.getFullYear(),
            pad(now.getMonth() + 1, 2),
            pad(now.getDate(), 2),
            '_',
            pad(now.getHours(), 2),
            pad(now.getMinutes(), 2)
        ].join(''),

        hookJS = new RegExp('js"></script>', 'g'),
        hookCSS = new RegExp('[.]css"', 'g'),

        replacedJS = fileContents.replace(hookJS, 'js?v=' + timestamp + '"></script>');

    return replacedJS.replace(hookCSS, '.css?v=' + timestamp + '"');

}

function replaceAnalyticsCode(fileContents, analyticsAccount) {
    var analyticsAccountRegExp = new RegExp( 'UA-XXXXX-X', 'gi' );
    return fileContents.replace( analyticsAccountRegExp, analyticsAccount);
}


/**
 * Resolve the build directory, checking for old files
 * to remove and re-creating the new build structure
 *
 * @param  {string} selectedVersion The type of build, i.e. staging, production, etc.
 *
 */
function resetExistingBuild(selectedVersion) {
    // Build Path
    var buildPath = path.resolve(config.buildBaseDir + selectedVersion);
    if (!fs.existsSync(config.buildBaseDir)) fs.mkdirSync(config.buildBaseDir);
    if (fs.existsSync(buildPath)) deleteRecursive(buildPath);
    fs.mkdirSync(buildPath);
}


/**
 * Recursively deletes files in a given path
 *
 * @param  {string} path
 *
 */
function deleteRecursive(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index) {
            var fullPath = path + "/" + file;
            if (isDir(fullPath)) { // recurse
                deleteRecursive(fullPath);
            } else { // delete file
                fs.unlinkSync(fullPath);
            }
        });
        fs.rmdirSync(path);
    } else {
        grunt.log.errorlns(path + ' does not exist, therefore it cannot be deleted');
    }
}

/**
 * Copy all images to specified directory
 *
 * @param  {string} selectedVersion version type, i.e. staging, production, etc.
 *
 */
function copyImages(selectedVersion) {
    var toCopy = config.imagesToCopy;
    grunt.log.writeln('Copying images...');
    toCopy.forEach(function(dir) {
        copy(path.resolve('test/src'), config.buildBaseDir + selectedVersion, dir);
    });
    grunt.log.writeln();
}


/**
 * Helper for checking if a path is a valid directory
 *
 * @param  {string}  path The full path
 * @return {Boolean}
 *
 */
function isDir(path) {
    return (fs.existsSync(path) && fs.statSync(path).isDirectory()) ? true : false;
}


/**
 * Recursively create directories
 *
 * @param  {srting} dirName The directory name
 *
 */
function mkdir(dirName) {
    var dirRoot = path.resolve(dirName + '/../');
    if (!fs.existsSync(dirRoot)) {
        //console.log(dirRoot, 'does not exist, creating it');
        mkdir(dirRoot);
    }
    fs.mkdirSync(dirName);
}


/**
 * Obtain the file source/contents
 *
 * @param  {string} filename The path to the file
 * @return The raw file file contents
 *
 */
function getFileContents(filename) {
    return fs.existsSync(filename) ? fs.readFileSync(filename, 'utf8') : null;
}



function pad(v, numChars) {
    var str = v.toString();
    while(str.length < numChars) {
        str = '0' + str;
    }
    return str;
}


/**
 * Merge two objects, not-overriding those properties
 * if they already exist.
 *
 * @param  {object} opts     Your object hash
 * @param  {object} defaults The object with properties you wish to include if no values are present
 * @return {object}          Your new object hash
 *
 */
function mergeObj (opts, defaults) {
    for (var prop in defaults) {
        if (prop in opts) continue;
        opts[prop] = defaults[prop];
    }
    return opts;
}


/**
 * Helper for writing files
 *
 * @param  {string} filename The filename
 * @param  {mixed} contents
 *
 */
function writeFile(filename, contents) {
    fs.writeFileSync(filename, contents, 'utf8');
}


/**
 * Copy files recursively
 *
 * @param  {string} src  The soource directory
 * @param  {string} dest The destination directory
 * @param  {string} item The image name
 *
 */
function copy(src, dest, item) {
    var srcItem = src + '/' + item;
    var destItem = dest + '/' + item;

    // Ensure root dir exists
    var rootDst = path.dirname(destItem);

    if (!fs.existsSync(rootDst)) mkdir(rootDst);

    // if srcItem is a dir create the dir on dst, and copy its contents recursively
    if (isDir(srcItem)) {
        var files = fs.readdirSync(srcItem);
        mkdir(destItem);
        files.forEach(function(f) {
            copy(srcItem, destItem, f);
        });
    } else {
        if (fs.existsSync(srcItem)) {
            var fileContents = fs.readFileSync(srcItem);
            fs.writeFileSync(destItem, fileContents);
            grunt.log.ok('Copied '+item+' to '+ destItem);
        }
    }
}


function copyJs (selectedVersion, compressed) {

    grunt.log.writeln('\nCopying Javascript...');

    var minifiedOutputPath = path.resolve(config.buildBaseDir, selectedVersion, 'js', 'app.min.js'),
        externsPath = path.resolve(config.buildSrcDir, 'js/lib/externs.js'),
        libs = [],
        js_dir = path.resolve(config.buildSrcDir, 'js/app'),
        js_app_dir = path.resolve(config.buildSrcDir, 'js/app'),
        js_lib_dir = path.resolve(config.buildSrcDir,'js/lib');

    if (compressed) {
        var externalTxt = '';

        libs.forEach(function(lib) {
            var contents = getFileContents(path.resolve(js_lib_dir, lib));
            externalTxt += contents + '\n \n';
        });

        fs.mkdirSync(path.dirname(minifiedOutputPath));
            // execSync(command, function(error, stdout, stderr) {
                var minified = getFileContents(minifiedOutputPath),
                everythingTogether = externalTxt + '\n' + minified;
                writeFile(minifiedOutputPath, everythingTogether);
        // });
    } else {

        libs.push('closure/third_party/closure/goog/dojo/dom/query.js');

        var filesToCopy = [];
        libs.forEach(function(item) {
            filesToCopy.push('lib/' + item);
        });

        filesToCopy.push('app');
        filesToCopy.push('lib/closure/closure/goog');

        filesToCopy.forEach(function(item) {
        copy(path.resolve(config.buildSrcDir, 'js'), path.resolve(config.buildBaseDir, selectedVersion, 'js'), item);
            // output.complete('Copied '+item);
        });
    }

}


function main(args) {

    // defaults
    var defaultArgs = {
        version: 'staging',
        compress: false,
        deploy: false,
        public: false
    };

    args = mergeObj(args, defaultArgs);

    var selectedVersion = args.version,
        compress = args.compress,
        deployToRemote = args.deploy,
        publicVersion = args.public;

    grunt.log.writeflags(args);
    grunt.log.writeln();

    resetExistingBuild(selectedVersion);

    copyImages(selectedVersion);

    processHTML(selectedVersion, config.versions[selectedVersion], compress);

    copyJs(selectedVersion, compress)

    // TODO
    // generateYaml(selectedVersion, versions[selectedVersion], publicVersion);

    // // copyBuildToProduction(selectedVersion, publicVersion);

    // if (deployToRemote) {
    //     // output.start('Deploying to '+ selectedVersion);
    //     deploy.deploy(path.resolve(buildBaseDir, selectedVersion), versions[selectedVersion].appengineappid, 'Deploying to ' + selectedVersion);
    // } else {
    //     output.complete('Build Complete');
    // }

}
