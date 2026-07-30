const RegionalTenday = require('./regionaltenday')
const RT = new RegionalTenday()

const upserttendayregional = RT.upserttendayregional.bind(RT)
const gettendayregionaldoc = RT.gettendayregionaldoc.bind(RT)

module.exports = {
  upserttendayregional,
  gettendayregionaldoc
}
