const Municipalities = require('./municipalities')

const M = new Municipalities()

const getmunicipalitiesreference = M.getmunicipalitiesreference.bind(M)
const upsertrawmunicipalities = M.upsertrawmunicipalities.bind(M)
const upsertformattedmunicipalities = M.upsertformattedmunicipalities.bind(M)
const upsertmunicipalitiesdiff = M.upsertmunicipalitiesdiff.bind(M)

module.exports = {
  getmunicipalitiesreference,
  upsertrawmunicipalities,
  upsertformattedmunicipalities,
  upsertmunicipalitiesdiff
}
