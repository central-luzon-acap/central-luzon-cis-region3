const cheerio = require('cheerio')

/**
 * Checks if an HTML tags string contains only the allowed set HTML tags
 * @param {String} htmlString
 * @returns {Bool}
 */
const sanitycheck = (htmlString) => {
  const allowedHTMLTags = ['ol', 'ul', 'li', 'span', 'p', 'strong', 'i', 'b', 'br']

  try {
    const $ = cheerio.load(htmlString, null, false)
    const tags = $('*')
      .get()
      .map(el => el.name)
      .filter((x, i, a) => a.indexOf(x) === i)

    return (tags.filter(item => !allowedHTMLTags.includes(item)).length === 0)
  } catch (err) {
    throw new Error(err.message)
  }
}

module.exports = sanitycheck
