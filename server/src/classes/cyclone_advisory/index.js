const TropicalCyclone = require('./cyclone')
const TC = new TropicalCyclone()

const scrapecycloneinfo = TC.scrapecycloneinfo.bind(TC)
const setcycloneinformation = TC.setcycloneinformation.bind(TC)
const setlowresgraphic = TC.setlowresgraphic.bind(TC)
const getcycloneinformation = TC.getcycloneinformation.bind(TC)

module.exports = {
  scrapecycloneinfo,
  setcycloneinformation,
  setlowresgraphic,
  getcycloneinformation
}
