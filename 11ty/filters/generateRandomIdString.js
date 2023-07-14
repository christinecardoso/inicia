/* ***** ----------------------------------------------- ***** **
/* ***** Absolute URL Filter
/* ***** ----------------------------------------------- ***** */

const { envUrls } = require('../../config.js');
const homeUrl = envUrls[process.env.NODE_ENV] || "";

if (!homeUrl) {
  console.warn(`No URL found for environment '${process.env.NODE_ENV}'. Falling back to empty string.`);
}

module.exports = value => {
  return homeUrl ? homeUrl + value : value;
}
