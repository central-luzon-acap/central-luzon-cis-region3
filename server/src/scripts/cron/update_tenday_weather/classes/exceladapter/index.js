const path = require('path')
const ExcelAdapter = require('./exceladapter')

const M = new ExcelAdapter({
  pathToFile: path.join(__dirname, '..', '..', '..', '..', 'data', 'pagasa_10_day_excel', 'day1.xlsx')
})

const longlistmunicipalities = M.longlistmunicipalities.bind(M)
const shaperegionlocationsdata = M.shaperegionlocationsdata.bind(M)
const getmunicipalitieslist = M.getmunicipalitieslist.bind(M)

module.exports = {
  longlistmunicipalities,
  shaperegionlocationsdata,
  getmunicipalitieslist
}
