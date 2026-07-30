// Checks if a request URL query contains one of the API keys defined in the ACAP_API_KEYS env variable
module.exports.isCollaborator = async (req, res, next) => {
  const { key } = req.query
  const ALL_KEYS = process.env.ACAP_API_KEYS.split(',')

  if (key === undefined) {
    return res.status(403).send('Unauthorized. Missing API key.')
  }

  if (!ALL_KEYS.includes(key)) {
    return res.status(403).send('Unauthorized.')
  }

  next()
}
