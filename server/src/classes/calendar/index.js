const CroppingCalendar = require('./calendar')
const CAL = new CroppingCalendar()

const getcropcalendar = CAL.getcropcalendar.bind(CAL)
const getcropcalendarall = CAL.getcropcalendarall.bind(CAL)
const getcropcalrecord = CAL.getcropcalrecord.bind(CAL)
const usecropcalendarseasonal = CAL.usecropcalendarseasonal.bind(CAL)
const usecropcalendartenday = CAL.usecropcalendartenday.bind(CAL)

module.exports = {
  CAL,
  getcropcalendar,
  getcropcalendarall,
  getcropcalrecord,
  usecropcalendarseasonal,
  usecropcalendartenday
}
