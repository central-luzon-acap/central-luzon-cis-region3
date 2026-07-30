const Report = require('./report')
const RP = new Report()

const createreport = RP.createreport.bind(RP)
const updateReportForSmsLogs = RP.updateReportForSmsLogs.bind(RP)
const deletereport = RP.deletereport.bind(RP)
const getreport = RP.getreport.bind(RP)

module.exports = {
  createreport,
  deletereport,
  getreport,
  updateReportForSmsLogs
}
