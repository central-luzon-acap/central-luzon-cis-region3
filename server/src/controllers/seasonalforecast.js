const {
  upsertforecast,
  getforecast,
  getforecastregion,
  getweathercondition
} = require('../classes/seasonalforecast')

const {
  upsertseasonalregional,
  getseasonalregionaldoc
} = require('../classes/regionalseasonal')

const { archiveseasonalforecast } = require('../classes/sharedweatherforecast/seasonal')

const pagasaExcelParser = require('../scripts/pagasaexcel')
const {
  MONTHS,
  REGION,
  DEFAULT_PROVINCE,
  SEASONAL_UPDATE_METHOD,
  FIRESTORE_DOCUMENTS,
  NO_DATA_AVAILABLE_VALUE
} = require('../utils/constants')

// Create or update a province's seasonal weather forecast rainfall data
module.exports.upsertForecastProvince = async (req, res, next) => {
  const { region, province, months } = req.body
  let result

  try {
    result = await upsertforecast({
      region,
      province,
      months,
      user: {
        email: req.user.email,
        id: req.user.user_id
      }
    })
  } catch (err) {
    next(new Error(err))
  }

  if (result) {
    try {
      const doc = await getforecast({ region, province })
      return res.status(200).json(doc.data())
    } catch (err) {
      next(new Error(err))
    }
  }

  return res.status(500).send('Something went wrong while saving data.')
}

// Create or update a region's (all provinces) seasonal weather forecast rainfall data
// Minus the "dry", "normal" and "mean" values which are set to 0.
// TO-DO: Read and store the "dry", "normal" and "mean" parameters
module.exports.upsertForecastRegion = async (req, res, next) => {
  const { region, provinces } = req.body
  let result
  const queries = []

  // Set the year for each month
  const years = provinces[0].months.reduce((acc, month) => {
    let year = new Date().getFullYear()
    const monthIndex = Object.keys(MONTHS).indexOf(month.mo)

    if (provinces[0].months.map(month => month.mo).includes('jan') && monthIndex <= 7 && monthIndex !== -1) {
      // Local (6) months list includes January
      year += 1
    }

    acc = [...acc, { month: month.mo, year }]
    return acc
  }, [])

  provinces.forEach((item) => {
    queries.push(upsertforecast({
      region,
      province: item.name,
      months: item.months.map(item => ({
        ...item,
        dry: 0,
        normal: 0,
        mean: 0,
        year: years.find(year => year.month === item.mo).year
      })),
      update_method: SEASONAL_UPDATE_METHOD.ENCODE,
      user: {
        email: req.user.email,
        id: req.user.user_id
      }
    }))
  })

  // Reset the no. of tropical cyclones data
  queries.push(upsertseasonalregional({
    region,
    documentName: FIRESTORE_DOCUMENTS.SEASONAL_REGIONAL.CYCLONES_COUNT,
    data: provinces[0].months.map((month, id) => ({ id, month: month.mo, value: 0 })),
    user: {
      email: req.user.email,
      id: req.user.user_id
    }
  }))

  try {
    result = await (Promise.all(queries))
  } catch (err) {
    next(new Error(err))
  }

  if (result) {
    try {
      const docs = await getforecastregion(region)
      return res.status(200).send(docs)
    } catch (err) {
      next(new Error(err))
    }
  }

  return res.status(500).send('Something went wrong while saving data.')
}

// Create or update a region's (all provinces) seasonal weather forecast rainfall data from PAGASA's excei file
module.exports.upsertForecastExcel = async (req, res, next) => {
  const getWholeNumberRounded = (value) => {
    return (value !== NO_DATA_AVAILABLE_VALUE)
      ? Math.round(value)
      : value
  }

  // Get the text/code version of the current month
  const getCurrentMonthCode = () => {
    const nowMonth = new Date().getMonth()
    return Object.keys(MONTHS)[nowMonth]
  }

  let activeSeasonalForecast

  try {
    // Fetch and cache the current "active" seasonal weather forecast before proceeding
    activeSeasonalForecast = await getforecastregion(REGION)
  } catch (err) {
    return next(new Error(err.message))
  }

  try {
    const { minmax, rainfall, normal, drydays } = await pagasaExcelParser(req.file.path)
    let result
    const queries = []

    const nowMonthCode = getCurrentMonthCode()
    const excelFileMonths = Object.values(rainfall)[0].map(x => Object.keys(MONTHS).find(month => MONTHS[month] === x.month))

    const excelMonthStart = new Date(`${MONTHS[excelFileMonths[0]]} 01`).getMonth()
    const nowMonth = new Date().getMonth()

    // Allow uploading an Excel file whose 1st month is 1 month ahead or equal to the current "now date's" month
    if ((nowMonth + 1) === excelMonthStart) {
      excelFileMonths.push(nowMonthCode)
    }

    // Exit if the current month is not included in the Excel file's (6) seasonal months
    if (!excelFileMonths.includes(nowMonthCode)) {
      return next(new Error('Current month is not present in the Excel file (6) seasonal months, or the (6) seasonal months may be too far ahead or behind the current month.'))
    }

    for (const province in rainfall) {
      // Use the original province name's text formatting
      const provinceName = activeSeasonalForecast.find(
        prov => prov.name.toLowerCase() === province.toLowerCase()
      )?.name

      if (!provinceName) {
        throw new Error(`Invalid or malformed province name: "${provinceName}"`)
      }

      queries.push(upsertforecast({
        region: REGION,
        province: provinceName,
        months: rainfall[province].map(item => ({
          // weather condition
          con: getweathercondition(item.rainfall),
          // (6) seasonal months code list
          mo: Object.keys(MONTHS).find(month => MONTHS[month] === item.month),
          // current year associated with the month
          year: item.year,
          // mean of mean/max rainfall
          mean: minmax[province].find(rec => rec.month === item.month).mean,
          // %N forecast rainfall value (table with colorful cells)
          val: item.rainfall,
          // normal rainfall value 1991-2020
          normal: normal[province]
            .find(rec => rec.month === item.month).normal,
          // dry/wet days forecast
          dry: getWholeNumberRounded(drydays[province]
            .find(rec => rec.month === item.month).forecast)
        })),
        update_method: SEASONAL_UPDATE_METHOD.EXCEL,
        user: {
          email: req.user.email,
          id: req.user.user_id
        }
      }))
    }

    try {
      // Upsert the newly-parsed seasonal weather forecast data
      result = await Promise.all(queries)
    } catch (err) {
      return next(new Error(err.message))
    }

    if (result) {
      try {
        // Archive the current "active" seasonal weather forecast before proceeding.
        // Fetch the newly-uploaded seasonal weather forecast data.
        /* eslint-disable no-unused-vars */
        const queries = [getforecastregion(REGION)]

        if (process.env.IS_RMCAS_API_ACTIVE === '1') {
          queries.push(archiveseasonalforecast(REGION, activeSeasonalForecast))
        }

        const [docs, _] = await Promise.all(queries)
        return res.status(200).send(docs)
      } catch (err) {
        return next(new Error(err))
      }
    }

    return res.status(500).send('Something went wrong while saving data.')
  } catch (err) {
    return next(new Error(err))
  }
}

// Update the global (common) regional seasonal weather forecast data
module.exports.updateForecastRegionalSeasonal = async (req, res, next) => {
  const { data, region, type } = req.body
  let monthsReference

  if (type === FIRESTORE_DOCUMENTS.SEASONAL_REGIONAL.CYCLONES_COUNT) {
    try {
      // Get months reference from a random province
      monthsReference = await getforecast({
        region,
        province: DEFAULT_PROVINCE
      })

      if (!monthsReference.exists) {
        return next(new Error('Failed to fetch the reference months data.'))
      }
    } catch (err) {
      return next(new Error(err))
    }
  }

  try {
    // Upsert the regional seasonal weather forecast rainfall data
    await upsertseasonalregional({
      region,
      documentName: type,
      data: (type === FIRESTORE_DOCUMENTS.SEASONAL_REGIONAL.CYCLONES_COUNT)
        ? monthsReference.data().months.map((item, id) => ({
          id,
          month: item.mo,
          value: data[id].value
        }))
        : data,
      user: {
        email: req.user.email,
        id: req.user.user_id
      }
    })
  } catch (err) {
    return next(new Error(err))
  }

  try {
    // Fetch and return the newly-created or updated document
    const doc = await getseasonalregionaldoc({
      region,
      documentName: type
    })

    if (!doc.exists) {
      return next(new Error('Failed to fetch common data.'))
    } else {
      return res.status(200).send(doc.data())
    }
  } catch (err) {
    return next(new Error(err))
  }
}
