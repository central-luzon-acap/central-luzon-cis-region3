const validateFiles = (excelData) => {
  const weatherData = {}

  // Validate extracted ordinal dates. Use the 1st province-municipality data on Day 1 as reference
  const baseDateRange = excelData[0][0].date_range
  const uniqueDates = [excelData[0][0].day_format]
  let errorMsg = ''

  // Validate dates for Day 2 - Day 10
  for (let i = 1; i < 10; i += 1) {
    const succeedingDateRange = excelData[i][0].date_range

    // Validate date range validity period
    if (succeedingDateRange !== baseDateRange) {
      errorMsg = `[ERROR]: Validity date range mismatch on Day ${i + 1}, ${succeedingDateRange}. Start date should be ${baseDateRange} (Day 1).`
      break
    }

    // Validate unique dates
    const currentDate = excelData[i][0].day_format
    if (uniqueDates.includes(currentDate)) {
      errorMsg = `[ERROR]: Day ${i + 1}, date ${currentDate} is not a unique date.`
      break
    }
  }

  if (errorMsg !== '') {
    throw new Error(errorMsg)
  }

  console.log(`[PROCESS]: Download and validation done on (${excelData.length}) 10-day weather excel files.`)

  // Filter days by municipality under province
  excelData.forEach((day, index) => {
    day.forEach(row => {
      if (weatherData[row.province] === undefined) {
        weatherData[row.province] = {}
      }

      if (weatherData[row.province][row.municipality] === undefined) {
        weatherData[row.province][row.municipality] = []
      }

      weatherData[row.province][row.municipality].push({ ...row, day: (index + 1) })
    })
  })

  return weatherData
}

module.exports = validateFiles
