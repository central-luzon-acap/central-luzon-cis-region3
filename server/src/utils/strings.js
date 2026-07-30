
/**
 * Replace all occurrences of whitespace characters with a replacement string
 * @param {String} text - Original text with target(s) to replace
 * @param {String} replacement - String to replace the all whitespace
 * @returns {String} Modified text
 */
const replaceWhitespaceWith = (text, replacement) => {
  return text.replace(/ /g, replacement)
}

module.exports = {
  replaceWhitespaceWith
}
