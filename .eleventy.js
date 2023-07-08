const path = require('path');
const pluginRss = require("@11ty/eleventy-plugin-rss"); // needed for absoluteUrl SEO feature
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const EleventyVitePlugin = require("@11ty/eleventy-plugin-vite");
const EleventyWebcPlugin = require('@11ty/eleventy-plugin-webc');
const Image = require("@11ty/eleventy-img");
const yaml = require("js-yaml"); // Because yaml is nicer than json for editors
require('dotenv').config();

const baseUrl = process.env.BASE_URL || "http://localhost:8080";
console.log('baseUrl is set to ...', baseUrl);

const globalSiteData = {
  title: "11ty Starter Site",
  description: "This is a basic 11ty starter template with my most commonly used features and modern tooling",
  locale: 'en',
  baseUrl: baseUrl,
}

module.exports = function(config) {

  /* --- GLOBAL DATA --- */

  config.addGlobalData("site", globalSiteData);

  /* --- YAML SUPPORT --- */

  config.addDataExtension("yaml", contents => yaml.load(contents));
  config.addDataExtension("yml", contents => yaml.load(contents));

  /* --- PASSTHROUGHS --- */

  // Static assets to pass through
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

  // Custom Random Helper Filter (useful for ID attributes)
  config.addFilter("generateRandomIdString", function (prefix) {
    return prefix + "-" + Math.floor(Math.random() * 1000000);
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
