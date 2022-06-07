const path = require('path');
const fs = require('fs');
const yargs = require('yargs');

// Generate pages object
const pages = {};

function getEntryFile(entryPath) {
  return fs.readdirSync(entryPath);
}

const chromeName = getEntryFile(path.resolve('src/entry'));

function getFileExtension(filename) {
  return /[.]/.exec(filename) ? /[^.]+$/.exec(filename)[0] : undefined;
}
chromeName.forEach((name) => {
  const fileExtension = getFileExtension(name);
  const fileName = name.replace(`.${fileExtension}`, '');
  pages[fileName] = {
    entry: `src/entry/${name}`,
    template: 'public/index.html',
    filename: `${fileName}.html`,
  };
});

const isDevMode = process.env.NODE_ENV === 'development';
const { argv } = yargs(process.argv);
const type = argv.extension ?? 'chrome';

const outputDir = path.join('dist', type);
module.exports = {
  pages,
  filenameHashing: false,
  outputDir,
  chainWebpack: (config) => {
    config.plugin('copy')
      .use(require('copy-webpack-plugin'), [
        {
          patterns: [
            {
              from: path.resolve('public/'),
              to: path.resolve(outputDir),
            },
            {
              from: path.resolve('src', `manifest.${type}.json`),
              to: path.resolve(outputDir, 'manifest.json'),
            },
          ],
        },
      ]);
  },

  configureWebpack: {
    output: {
      filename: '[name].js',
      chunkFilename: '[name].js',
    },
    devtool: isDevMode ? 'inline-source-map' : false,
  },

  css: {
    extract: false, // Make sure the css is the same
  },

  pluginOptions: {
    vuetify: {
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
    },
  },
};
