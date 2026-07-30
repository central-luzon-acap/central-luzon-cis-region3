const TyphoonAdvisory = require('./typhoonadvisory')
const TA = new TyphoonAdvisory()

const scrapetyphooninfo = TA.scrapetyphooninfo.bind(TA)
const settyphooninformation = TA.settyphooninformation.bind(TA)
const gettyphooninformation = TA.gettyphooninformation.bind(TA)

module.exports = {
  scrapetyphooninfo,
  settyphooninformation,
  gettyphooninformation
}
