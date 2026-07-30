const Provinces = require('./provinces')

const PR = new Provinces()

const upsertprovincesinfo = PR.upsertprovincesinfo.bind(PR)
const getprovincesinfo = PR.getprovincesinfo.bind(PR)
const getmunicipalities = PR.getmunicipalities.bind(PR)

module.exports = {
  upsertprovincesinfo,
  getprovincesinfo,
  getmunicipalities
}
