const publicSeasonalWeatherForecast = require('./publicseasonal')
const publicSpecialWeatherForecast = require('./publicspecial')
const { getsharedtendayforecast } = require('../../classes/sharedweatherforecast/tenday')

const WEATHER_TYPES = {
  TENDAY: 'tenday',
  SEASONAL: 'seasonal',
  SPECIAL: 'special'
}

module.exports.shareWeatherForecast = async (req, res, next) => {
  const { type, province } = req.query

  if (!type || !province) {
    return res.status(500).send('Missing parameters')
  }

  if (!Object.values(WEATHER_TYPES).includes(type)) {
    return res.status(500).send('Unsupported weather type')
  }

  switch (type) {
    case WEATHER_TYPES.TENDAY:
      try {
        const data = await getsharedtendayforecast({
          region: process.env.REGION_NAME,
          province,
          showDateCreatedTS: false,
          minimalError: true
        })

        return res.status(200).send(data)
      } catch (err) {
        return next(new Error(err))
      }
    case WEATHER_TYPES.SEASONAL:
      try {
        const data = await publicSeasonalWeatherForecast(province)
        return res.status(200).send(data)
      } catch (err) {
        return next(new Error(err))
      }
    case WEATHER_TYPES.SPECIAL:
      try {
        const region = process.env.REGION_NAME ?? ''
        const data = await publicSpecialWeatherForecast(region)
        return res.status(200).send(data)
      } catch (err) {
        return next(new Error(err))
      }
    default:
      return res.status(500).send('Unsupported weather type')
  }
}
