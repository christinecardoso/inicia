const path = require('path');
const pluginRss = require("@11ty/eleventy-plugin-rss"); // needed for absoluteUrl SEO feature
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const EleventyVitePlugin = require("@11ty/eleventy-plugin-vite");
const EleventyWebcPlugin = require('@11ty/eleventy-plugin-webc');
const yaml = require("js-yaml"); // Because yaml is nicer than json for editors
require('dotenv').config();
const slugify = require('slugify');
const markdownIt = require("markdown-it");
const markdownItAttrs = require('markdown-it-attrs')
const markdownItEleventyImg = require("markdown-it-eleventy-img");
const { applySharedConfig } = require('@cc/sapphire/lib/index');
const daisyui = require('daisyui');

// Import filters
require('@cc/sapphire/lib');
// const collections = require('@cc/sapphire/lib/utils/collections/index');

// const filters = require('./11ty/functions/filters');
// const shortcodes = require('./11ty/functions/shortcodes');
// const utils = require('./11ty/functions/utils');
// Importing from config
// const collections = require('./11ty/config/collections');
// const site = require('../../src/_data/site.json');
// const baseUrl = process.env.NODE_ENV === 'production' ? site.baseUrl.production : data.site.baseUrl.development;
// console.log('baseUrl is set to ...', baseUrl);

module.exports = function(config) {
  applySharedConfig(config);

  // config.addCollection("sectionss", function(collectionApi) {
  //   return collectionApi.getAll()
  //   .filter(item => item.url.includes("/vault/sections/"))
  //   .sort((a, b) => {
  //     const orderA = a.data.order || 0;
  //     const orderB = b.data.order || 0;
  //     return orderA - orderB;
  //   });
  //
  //   // Group sections by version
  //   const groupedSections = {};
  //   sortedSections.forEach(section => {
  //     const version = section.data.version || 'default';
  //     if (!groupedSections[version]) {
  //       groupedSections[version] = [];
  //     }
  //     groupedSections[version].push(section);
  //   });
  //
  //   return groupedSections;
  // });

  /* --- GLOBAL DATA --- */
  // config.addGlobalData("site", data.site);

  // /* --- COLLECTIONS --- */
  // Object.keys(collections).forEach(collectionName => {
  //   config.addCollection(collectionName, collections[collectionName]);
  // });

  // Object.entries(collections).forEach(([collectionName, collections]) => {
  //   config.addShortcode(collectionName, collections);
  // });


  // /* --- SHORTCODES --- */
  // Object.keys(shortcodes).forEach(shortcodeName => {
  //   config.addShortcode(shortcodeName, shortcodes[shortcodeName]);
  // });

  // /* --- FILTERS --- */
  // Object.keys(filters).forEach(filterName => {
  //   config.addFilter(filterName, filters[filterName]);
  // });

  /* --- FILTERS --- */

  config.setLibrary('md', markdownIt({
      html: true,
      breaks: true,
      linkify: true
    })
    .use(markdownItAttrs)
    .use(markdownItEleventyImg, {
      imgOptions: {
        widths: [800, 500, 300],
        urlPath: "/images/",
        outputDir: path.join("_site", "images"),
        formats: ["avif", "webp", "jpeg"]
      },
      globalAttributes: {
        class: "markdown-image",
        decoding: "async",
        // If you use multiple widths,
        // don't forget to add a `sizes` attribute.
        sizes: "100vw"
      }
      // Specify options for markdown-it-eleventy-img here
      // For example:
      // imgPathTransform: (imgPath) => `./path/to/${imgPath}`
    })
  );

  //allow merging data from multiple data files
  config.setDataDeepMerge(true);

  /* --- YAML SUPPORT --- */

  config.addDataExtension("yaml", contents => yaml.load(contents));
  config.addDataExtension("yml", contents => yaml.load(contents));

  /* --- PASSTHROUGHS --- */
  // Static assets to pass through
  config.addPassthroughCopy('./src/assets/scss')
  config.addPassthroughCopy('./src/assets/css')
	config.addPassthroughCopy('./src/assets/js')
  config.addPassthroughCopy('./src/assets/images');
  config.addPassthroughCopy('./src/assets/public');

  /* --- PLUGINS --- */
  config.addPlugin(pluginRss); // just includes absolute url helper function
  config.addPlugin(eleventyNavigationPlugin);
  config.addPlugin(EleventyVitePlugin, {});
  config.addPlugin(EleventyWebcPlugin, {
    components: 'src/includes/components/**/*.webc',
  });

  config.setServerOptions({
    // Default values are shown:

    // Whether the live reload snippet is used
    liveReload: true,

    // Whether DOM diffing updates are applied where possible instead of page reloads
    domDiff: true,

    // The starting port number
    // Will increment up to (configurable) 10 times if a port is already in use.
    port: 8080,

    // Additional files to watch that will trigger server updates
    // Accepts an Array of file paths or globs (passed to `chokidar.watch`).
    // Works great with a separate bundler writing files to your output folder.
    // e.g. `watch: ["_site/**/*.css"]`
    watch: [],

    // Show local network IP addresses for device testing
    showAllHosts: false,

    // Use a local key/certificate to opt-in to local HTTP/2 with https
    https: {
      // key: "./localhost.key",
      // cert: "./localhost.cert",
    },

    // Change the default file encoding for reading/serving files
    encoding: 'utf-8',
  });

  /* --- BASE CONFIG --- */

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "includes", // this path is releative to input-path (src/)
      layouts: "layouts", // this path is releative to input-path (src/)
      data: "data", // this path is releative to input-path (src/)
      // Set the content directory to the submodule
    },
    passthroughFileCopy: true,
    templateFormats: ["njk", "md", 'webc', 'liquid'],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    dataTemplateEngine: 'njk',
  };
};
