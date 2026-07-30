/**
 * Finds the (6) seasonal months that come before AND after a target month, using the current year as base by default.
 * @param {String} month - Month code
 * @param {Number} year - Year
 * @param {Number} windowLength - Length of seasonal months
 * @returns {Object[]} [{ month, year }...] with the "month" param in the middle of (5) seasonal months before and (5) seasonal months after.
 */
const findSeasonalMonthsIncludesTargetMonth = (month, year, windowLength = 6) => {
  const numbers = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  const moIndex = numbers.findIndex(mo => mo === month)
  const chain = new Array(numbers.length - 1).fill(null)
  let variableYear = parseInt(year ?? new Date().getFullYear())

  // Left side
  let cursor = moIndex
  let chainCursor = windowLength - 1

  while (chainCursor !== -1) {
    chain[chainCursor--] = {
      month: numbers[cursor],
      year: variableYear
    }

    if (cursor - 1 >= 0) {
      cursor -= 1
    } else {
      variableYear -= 1
      cursor = numbers.length - 1
    }
  }

  // Right side
  variableYear = parseInt(year ?? new Date().getFullYear())
  cursor = moIndex
  chainCursor = windowLength - 1

  while (chainCursor !== numbers.length - 1) {
    chain[chainCursor++] = {
      month: numbers[cursor],
      year: variableYear
    }

    if (cursor + 1 <= numbers.length - 1) {
      cursor += 1
    } else {
      cursor = 0
    }

    if (cursor !== moIndex && numbers[cursor] === 'jan') {
      variableYear += 1
    }
  }

  return chain
}

module.exports = {
  findSeasonalMonthsIncludesTargetMonth
}
