const RegionalSeasonal = require('./regionalseasonal')
const RS = new RegionalSeasonal()

const upsertseasonalregional = RS.upsertseasonalregional.bind(RS)
const getseasonalregionaldoc = RS.getseasonalregionaldoc.bind(RS)

module.exports = {
  upsertseasonalregional,
  getseasonalregionaldoc
}
