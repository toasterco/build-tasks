module.exports = {

    baseDir: 'test/', // The root directory of the application

    baseTemplateInFilename: 'base.html', // The template file used to process analytics, compressed tags, etc.
   	baseTemplateOutFilename: 'index.html', // The output file of your processed HTML template

    // Th edifferent types of build versions
    versions: {
	    'staging': {
	        appengineappid: 'google.com:privacyweek-staging',
	        analyticsAccount: 'UA-123456-1',
	        versionId: 'stage'
	    },
	    'production': {
	        appengineappid: 'google.com:privacyweek',
	        analyticsAccount: 'UA-123456-2',
	        versionId: 'production'
	    }
	},

    tagCompressed: {
        open: '<!--COMPRESSED--><!--',
        close: '--><!--/COMPRESSED-->'
    },
    tagUncompressed: {
        open: '<!--UNCOMPRESSED-->',
        close: '<!--/UNCOMPRESSED-->'
    },

    // Namespaces (or the provided module name in your app.js file)
    namespaces: [
        'pw.app.Application'
    ],
    // Array of files or directories to include when copying
    imagesToCopy: [
        'img',
        'favicon.ico'
    ]

};
