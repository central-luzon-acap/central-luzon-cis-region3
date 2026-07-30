const Search = require('./search')
const SW = new Search()

const createsearchwords = SW.createsearchwords.bind(SW)

module.exports = {
  createsearchwords
}
