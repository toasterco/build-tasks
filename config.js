
/** -----------------------------------------------------------------------------------------------
 * GRUNT CONFIG
 * ----------------------------------------------------------------------------------------------*/

// NodeJS requirements
var path = require('path');

/**
 * Instantiating Config
 * Do not change these settings
 */

var config = {
    versions: {
	    staging: { versionId: 'stage' },
	    production: { versionId: 'production' }
	},
    tagCompressed: { open: '<!--COMPRESSED--><!--', close: '--><!--/COMPRESSED-->' },
    tagUncompressed: { open: '<!--UNCOMPRESSED-->', close: '<!--/UNCOMPRESSED-->' },

    /**
     * Placeholders for application-specific settings
     */
    baseDir: '',
    build: {
    	dir: '',
    	template: ''
    },
    src: {
    	dir: '',
    	template: '',
    	cssDir: '',
    	cssFilename: '',
    	jsDir: '',
    	jsFilename: ''
    },
    jsExterns: '',
    namespaces: [],
    imagesToCopy: [],
    yamlFilename: '',
    pyScripts: []

};

/**
 * Full Build Log - if set to true there will be more logs when exicuting the build script
 * @type {boolean}
 */
config.fullBuildLog = false;
config.name = 'AppName';
config.homepage = '';
config.author = 'Toaster Ltd';
config.licence = 'Licensed MIT';

// App-specific settings
config.baseDir = path.resolve('./test') + '/'; // The root directory of the application

config.build.dir = config.baseDir + 'build/';
config.build.template = config.build.dir + 'index.html'; // The output file of your processed HTML template

config.src.dir = config.baseDir + 'src/';
config.src.template = config.src.dir + 'base.html'; // The template file used to process analytics, compressed tags, etc.
config.src.cssDir = config.src.dir + 'css/';
config.src.cssFilename = 'styles.css';
config.src.jsDir = config.src.dir + 'js/';
config.src.jsFilename = 'app.min.js'; // Name of the compiled javascript
config.src.imgDir = config.src.dir + 'img/';

config.versions.staging.appengineappid = 'google.com:yourapp-staging';
config.versions.staging.analyticsAccount = 'UA-123456-1';

config.versions.production.appengineappid = 'google.com:yourapp';
config.versions.production.analyticsAccount = 'UA-123456-2';

config.jsExterns = 'lib/externs.js'; // external javascript code

// Namespaces (or the provided module name in your app.js file)
config.namespaces = [
	'pw.app.Application'
];

// Array of files or directories to include when copying
config.foldersToCopy = [
    'img'
];

// Python scripts to include when generating Yaml
config.yamlFilename = 'app.yaml';
config.pyScripts = [
	'main',
    'manage',
    'helpers',
    'models'
];

// Export Config
module.exports = config;
