BuildTasks
==========

## Getting Started With A New Project

Tasks are run using [Grunt.js](gruntjs.org), all of which are defined in `Gruntfile.js`.

To get started, please make sure you have [Node.js and (npm) installed](http://nodejs.org/) first. After this, download both `Gruntfile.js` and `package.json` files and place them in the root of your project directory.

Now run the following command to install the required node packages (these are defined `package.json`).

```bash
$ npm install
```

Once the process has finished, please modify the file location settings and update the project-specific meta in `Gruntfile.js`.

## Running the Tasks

Please make sure the asset file locations are correctly set in `Gruntfile.js` before running these:

### Developing Locally

#### ```$ grunt```

Run when editing/developing locally. If you like to see your changes update in real-time in the browser, please install the [LiveRealod Chrome Extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei). Sass, markdown and src files will auto-compile as changes are made.

### Developing for Deployment

#### ```$ grunt build```

[JSHint](http://jshint.com/docs/) is run before any compilation is done – please check your terminal for any warnings. All Javascript is concatenated into a single file after which they are compressed and minifed. All SASS components are minified into a single-line file.
