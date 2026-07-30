const { PROVINCE_LIST_LOWERCASE } = require('../../../utils/constants')

const MONTHS = [
  { id: 0, full: 'January', abbrev: 'Jan' },
  { id: 1, full: 'February', abbrev: 'Feb' },
  { id: 2, full: 'March', abbrev: 'Mar' },
  { id: 3, full: 'April', abbrev: 'Apr' },
  { id: 4, full: 'May', abbrev: 'May' },
  { id: 5, full: 'June', abbrev: 'Jun' },
  { id: 6, full: 'July', abbrev: 'Jul' },
  { id: 7, full: 'August', abbrev: 'Aug' },
  { id: 8, full: 'September', abbrev: 'Sept' },
  { id: 9, full: 'October', abbrev: 'Oct' },
  { id: 10, full: 'November', abbrev: 'Nov' },
  { id: 11, full: 'December', abbrev: 'Dec' }
]

module.exports = {
  MONTHS,
  PROVINCE_LIST_LOWERCASE
}
