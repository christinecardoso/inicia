// _filters/replaceBusinessName.js
module.exports = function(content, siteName) {
  if (!content || !siteName) {
    return content;
  }

  return content.replace(/\[Business Name\]/g, siteName);
};
