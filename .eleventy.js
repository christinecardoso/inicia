const path = require('path');
const pluginRss = require("@11ty/eleventy-plugin-rss"); // needed for absoluteUrl SEO feature
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const EleventyVitePlugin = require("@11ty/eleventy-plugin-vite");
const EleventyWebcPlugin = require('@11ty/eleventy-plugin-webc');
const Image = require("@11ty/eleventy-img");
const yaml = require("js-yaml"); // Because yaml is nicer than json for editors
require('dotenv').config();
const slugify = require('slugify');
const markdownIt = require("markdown-it");
const markdownItAttrs = require('markdown-it-attrs');

const baseUrl = process.env.NODE_ENV === 'production' ? 'https://inicia.netlify.app' : 'http://localhost:8080';
console.log('baseUrl is set to ...', baseUrl);

const globalSiteData = {
  title: "11ty Starter Site",
  description: "This is a basic 11ty starter template with my most commonly used features and modern tooling",
  locale: 'en',
  baseUrl: baseUrl,
}

// Import filters
const absoluteUrl = require('./11ty/filters/absoluteUrl.js');

module.exports = function(config) {
  config.setLibrary('md', markdownIt().use(markdownItAttrs));

  /* --- GLOBAL DATA --- */

  config.addGlobalData("site", globalSiteData);

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

  /* --- SHORTCODES --- */

  // Image shortcode config
  let defaultSizesConfig = "(min-width: 1200px) 1400px, 100vw"; // above 1200px use a 1400px image at least, below just use 100vw sized image

  config.addShortcode("image", async function(src, alt, className = "", sizes=defaultSizesConfig) {
		console.log(`Generating image(s) from:  ${src}`)
    let metadata = await Image(src, {
			widths: [800, 1500],
			formats: ["webp", "png", "svg"],
      urlPath: "../assets/images/",
			outputDir: "./_site/assets/images/",
			filenameFormat: function (id, src, width, format, options) {
				const extension = path.extname(src)
				const name = path.basename(src, extension)
				return `${name}-${width}w.${format}`
			}
		});

		let imageAttributes = {
			alt,
			sizes,
			loading: "lazy",
			decoding: "async",
      class: className // Add the provided class to the image element
		};

		return Image.generateHTML(metadata, imageAttributes);
	});

  // Output year for copyright notices
  config.addShortcode("year", () => `${new Date().getFullYear()}`);

  /* --- FILTERS --- */
  config.addFilter('absoluteUrl', absoluteUrl);
  config.addFilter('replaceBusinessName', require('./11ty/filters/replaceBusinessName'));

  // Custom Random Helper Filter (useful for ID attributes)
  config.addFilter("generateRandomIdString", function (prefix) {
    return prefix + "-" + Math.floor(Math.random() * 1000000);
  });

  config.addFilter("jsonify", function(value) {
    return JSON.stringify(value);
  });

  config.addFilter("prettyJsonify", function(value) {
  return JSON.stringify(value, null, 2);
  });

  config.addFilter("json", (content) => {
    return JSON.stringify(content);
  });

  // Custom filter to get the last modified date of posts with a specific tag
  config.addFilter("getLastModifiedDateForTag", function(posts, tag) {
    let lastModifiedDate = null;

    for (const post of posts) {
      if (post.data.tags && post.data.tags.includes(tag) && (!lastModifiedDate || post.date > lastModifiedDate)) {
        lastModifiedDate = post.date;
      }
    }

    return lastModifiedDate;
  });

  config.addFilter('htmlDateString', (dateObj) => {
    const date = new Date(dateObj);
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  config.addFilter('readableDate', (dateObj) => {
    const date = new Date(dateObj);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  });

  /* --- COLLECTIONS --- */

config.setDataDeepMerge(true);

  // Define a collection for sections
// config.addCollection('sections', function(collection) {
//   return collection.getFilteredByGlob('sections/*.md');
// });
  // config.addCollection('posts', function(collection) {
  //   return collection.getAll();
  // });

  config.addCollection("sections", function(collectionApi) {
    return collectionApi.getAll()
    .filter(item => item.url.includes("/sections/"))
    .sort((a, b) => {
      const orderA = a.data.order || 0;
      const orderB = b.data.order || 0;
      return orderA - orderB;
    });

    // Group sections by version
    const groupedSections = {};
    sortedSections.forEach(section => {
      const version = section.data.version || 'default';
      if (!groupedSections[version]) {
        groupedSections[version] = [];
      }
      groupedSections[version].push(section);
    });

    return groupedSections;
  });

  // Define taxonomies
  // config.addCollection("tagsList", function(collection) {
  //   const excludedTags = ["post", "travel"];
  //   const tagsList = Array.from(
  //     new Set(
  //       collection
  //         .getAll()
  //         .flatMap(item => item.data.tags || [])
  //         .filter(tag => !excludedTags.includes(tag))
  //     )
  //   );
  //   return tagsList;
  // });
  config.addCollection("tagList", collection => {
    // Initialize an object to store tag counts
    const tagsObject = {}

    // Iterate through all items in the collection
    collection.getAll().forEach(item => {
      // Check if the item has tags
      if (!item.data.tags) return;

      // Filter out specific tags (e.g., 'post' and 'all') and count the remaining ones
      const excludedTags = ["post", "all"];

      item.data.tags
        .filter(tag => !excludedTags.includes(tag))
        .forEach(tag => {
          // Generate slugified name
          const slugifiedName = slugify(tag, { lower: true });

          // Increment tag count in tagsObject
          if(typeof tagsObject[tag] === 'undefined') {
            tagsObject[tag] = { count: 1, permalink: slugifiedName };
          } else {
            tagsObject[tag].count += 1;
            tagsObject[tag].permalink = slugifiedName;
          }
        });
    });

    // Convert the tagsObject into an array of objects
    const tagList = Object.keys(tagsObject).map(tag => ({
      name: tag,
      count: tagsObject[tag].count,
      permalink: `/tags/${tagsObject[tag].permalink}/`,
    }));

    // Sort the tagList based on tag count in descending order
    return tagList.sort((a, b) => b.count - a.count)

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
    },
    passthroughFileCopy: true,
    templateFormats: ["njk", "md", 'webc', 'liquid'],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    dataTemplateEngine: 'njk',
  };
};
