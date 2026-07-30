const https = require('https')
const axios = require('axios')

/**
 * Returns a regular axios module or an axios instance that accepts insecure SSL certificates
 * @typedef {Object} parameter
 * @param {Bool} parameter.rejectUnauthorized - Ignore SSL/TLS certificate verification errors and accept self-signed or invalid certificates in axios. Defaults to 'true' (recommended for security)
 * @returns axios or a custom axios instance
 */
const AxiosInstance = ({ rejectUnauthorized = true }) => {
  const httpsAgent = new https.Agent({
    rejectUnauthorized
  })

  return (rejectUnauthorized)
    ? axios
    : axios.create({ httpsAgent })
}

module.exports = {
  AxiosInstance
}
