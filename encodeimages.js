var path = require('path');
var grunt = require('grunt');
var exec = require('child_process').exec;
var fs = require('fs');
var config = require('./config');

encodeimages = (function () {
	return {
		webp: function (srcItem) {

			var self = this;

		    if (isDir(srcItem)) {

		        var files = fs.readdirSync(srcItem);
		        files.forEach(function(file) {
		        	self.webp(path.resolve(srcItem, file));
		        });

		    } else {

		        if (fs.existsSync(srcItem)) {
		        	self.encode(srcItem);
		        }

		    }

		},
		encode: function (file) {
			exec('cwebp -lossless ' + file + ' -o ' + path.basename(file, '.png') + '.webp', function (error, stdout, stderr) {
				console.log('finished!');
			});
		}
	};
})();

function isDir (path) {
    return (fs.existsSync(path) && fs.statSync(path).isDirectory()) ? true : false;
}

module.exports = encodeimages;
