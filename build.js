// Node modules
var fs = require('fs');
var sys = require('sys');
var path = require('path');
var htmlMinifier = require('html-minifier');

var grunt = require('grunt');
var config = require('./config');

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

    var baseFile = processFile(config.src.template, compressed, versionVars.analyticsAccount);
    var outputLocation = path.resolve(config.build.dir, versionKey, path.basename(config.build.template));

    if (compressed) {
        baseFile = htmlMinifier.minify(baseFile, {
            collapseWhitespace: false,
            removeComments: false
        });
        grunt.log.ok('HTML Minified');
    }

    writeFile(outputLocation, baseFile);
    grunt.log.ok('HTML created in '+ outputLocation);
}

function processFile (file, compressed, analyticsAccount) {

    compressed = compressed || false;

    var fileContents = getFileContents(path.resolve(file));
    var processedTags = processCompressedTags(fileContents, compressed);
    var replacedAnalytics = replaceAnalyticsCode(processedTags, analyticsAccount);

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


/**
 * Adds a date-versioning to the query string of the file
 *
 * @param {string} fileContents
 *
 */
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
    var buildPath = path.resolve(config.build.dir + selectedVersion);
    if (!fs.existsSync(config.build.dir)) fs.mkdirSync(config.build.dir);
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
 * Copy all folders to specified directory
 *
 * @param  {string} selectedVersion version type, i.e. staging, production, etc.
 *
 */
function copyFolders(selectedVersion) {
    grunt.log.writeln('\nCopying folders...');

    var toCopy = config.foldersToCopy;
    toCopy.forEach(function(dir) {
        copy(path.resolve(config.src.dir), config.build.dir + selectedVersion, dir);
    });

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
        if (config.fullBuildLog) grunt.log.ok(dirRoot, 'does not exist, creating it');
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


/**
 * Pad a string/numver with leading zeros
 *
 * @param  {string/number} v
 * @param  {number} numChars    The number of leading zeros to pad the number by
 * @return {str}
 *
 */
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
            if ( config.fullBuildLog ) grunt.log.ok('Copied '+item+' to '+ destItem);
        }
    }
}


/**
 * Generate Yaml
 *
 * @param {String} versionKey
 * @param {{ appengineappid, versionId}} versionVars
 * @param {Boolean} isPublic
 *
 */
function generateYaml(versionKey, versionVars, isPublic) {

    grunt.log.writeln('\nGenerating Yaml...');

    var yamlPath = config.yamlFilename;
    var pyScripts = config.pyScripts;
    var baseInputDir = config.src.dir;
    var baseOutputDir = path.resolve(config.build.dir, versionKey);
    var yamlContents = getFileContents(path.resolve(baseInputDir, yamlPath));

    // Replace appengine id and version in yaml before writing.
    yamlContents = yamlContents.replace('appengineappid', versionVars.appengineappid);
    yamlContents = yamlContents.replace('versionId', versionVars.versionId);

    writeFile(path.resolve(baseOutputDir, yamlPath), yamlContents);

    // copy py scripts over to build dir.
    pyScripts.forEach(function(script) {
        copy(path.resolve(baseInputDir), baseOutputDir, script + '.py');
    });

}


/**
 * Copy Javascript files
 *
 * If compressed, only include a single file, otherwise copy over all
 * included modules, libs and scripts.
 *
 * @param  {string} selectedVersion
 * @param  {string} compressed
 *
 */
function copyJs (selectedVersion, compressed) {
    grunt.log.writeln('\nCopying Javascript...');

    var pathOutMin = path.resolve(config.build.dir, selectedVersion, 'js', config.src.jsFilename),
        externsPath = path.resolve(config.src.jsDir, config.jsExterns),
        libs = [],
        js_dir = path.resolve(config.src.jsDir, 'app'),
        js_app_dir = path.resolve(config.src.jsDir, 'app'),
        js_lib_dir = path.resolve(config.src.jsDir, 'lib');

    if (compressed) {

        copy(path.resolve(config.src.dir, 'js'), path.dirname(pathOutMin), config.src.jsFilename);

    } else {

        // Copy lib files
        var filesToCopy = [];
        libs.forEach(function(item) {
            filesToCopy.push('lib/' + item);
        });

        // Include app & closure files
        filesToCopy.push('app');
        filesToCopy.push('lib/closure/closure/goog');

        filesToCopy.forEach(function(item) {
            copy(path.resolve(config.src.dir, 'js'), path.resolve(config.build.dir, selectedVersion, 'js'), item);
        });
    }

}

/**
 * Copy over all CSS files
 *
 * @param  {string} selectedVersion
 *
 */
function copyCss (selectedVersion) {
    grunt.log.writeln('\nCopying CSS...');

    var pathOut = path.resolve(config.build.dir, selectedVersion, 'css');
    var pathIn = config.src.cssDir;

    copy(pathIn, pathOut, config.src.cssFilename);

}

/**
 * Main
 * @param {{}} args
 */
function main(args) {

    // defaults
    var defaultArgs = {
        version: 'staging',
        compress: false,
        public: false
    };

    args = mergeObj(args, defaultArgs);

    var selectedVersion = args.version;
    var compress = args.compress;
    var publicVersion = args.public;

    grunt.log.writeflags(args);
    grunt.log.writeln();


    resetExistingBuild(selectedVersion);

    processHTML(selectedVersion, config.versions[selectedVersion], compress);

    copyFolders(selectedVersion);
    copyJs(selectedVersion, compress);
    copyCss(selectedVersion);

    // generateYaml(selectedVersion, config.versions[selectedVersion], publicVersion);

    grunt.log.ok('\nBuild Complete!');

}

module.exports = main;
