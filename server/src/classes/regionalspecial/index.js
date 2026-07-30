const RegionalSpecialWeather = require('./regionalspecial')
const RS = new RegionalSpecialWeather()

const upsertspecialregional = RS.upsertspecialregional.bind(RS)
const getspecialregionaldoc = RS.getspecialregionaldoc.bind(RS)

module.exports = {
  upsertspecialregional,
  getspecialregionaldoc
}
