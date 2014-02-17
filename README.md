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

If you need to list the available tasks, please run the following:

```bash
$ grunt --help
```

Please make sure you have correctly set up the project settings and file locations in `config.js` before running these:

### ```$ grunt```

Run when editing/developing locally. If you like to see your changes update in real-time in the browser, please install the [LiveReload Chrome Extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei). Sass, markdown and src files will auto-compile as changes are made.

### ```$ grunt build[:dev|:dist]```

The build task can be run with an optional subtask of either `dist` (default) or `dev`.

Building with the `:dev` flag will compile all specified Javascript files with 'pretty-print' formatting, no obfuscation and the debugging flag turned on. Ideally used for staging/debugging. SASS files are compiled and **expanded**.

The `:dist` option applies maximum compression and obfuscation to Javascript files, usually for deployment only. SASS files are compiled and **compressed** into a single-line file.
