const wordDictionary = require('../scripts/data/word_dictionary.json')

/**
 * Generate a non-sensical sentence made up of random foreign words
 * @param {Number} wordCount - Maximum number of words to include in the sentence
 * @returns {String} Sentence containing random words
*/
const acapLipsum = (wordCount = 0) => {
  const minw = 5
  const maxw = 15

  // Set a specified word length or use a random max (15) word length
  const maxWords = (wordCount > 0)
    ? wordCount
    : Math.floor(Math.random() * (maxw - minw + 1) + minw)

  // Generate random word dictionary indices
  const wordIndex = []

  while (wordIndex.length < maxWords) {
    const min = 0
    const max = wordDictionary.length - 1

    // Random word index
    const index = Math.floor(Math.random() * (max - min + 1) + min)

    if (maxWords < max) {
      // Generate unique indices if the total words required
      // is less than the total word entries in DB
      if (!wordIndex.includes(index)) {
        wordIndex.push(index)
      }
    } else {
      // Use repeating words
      wordIndex.push(index)
    }
  }

  // Construct the random-word sentence
  const sentence = wordIndex.reduce((acc, curr) => {
    acc += wordDictionary[curr].word + ' '
    return acc
  }, '')

  return sentence
}

module.exports = acapLipsum
