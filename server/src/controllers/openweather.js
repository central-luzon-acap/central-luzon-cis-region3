const { getweathertoday } = require('../classes/openweather')

// Get the current weather today with 7 days forecast from Openweather
module.exports.getWeatherToday = async (req, res, next) => {
  const { lat, lon } = req.query

  if (!lat || !lon) {
    return res.status(500).send('Missing parameters')
  }

  try {
    const response = await getweathertoday(lat, lon)
    return res.status(200).send(response.data)
  } catch (err) {
    next(new Error(err))
  }
}
