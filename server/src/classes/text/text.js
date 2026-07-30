const axios = require('axios')

class Text {
  async sendSmsRecommendations (numbers, message) {
    // Docs for Semaphore: https://semaphore.co/docs and look for "Bulk Messages"
    const BASE_URL = 'https://api.semaphore.co/api/v4/messages'
    const stringifiedNumbers = numbers.toString()

    try {
      return await axios.post(BASE_URL, {
        apikey: process.env.SEMAPHORE_API_KEY,
        number: stringifiedNumbers,
        message
      })
    } catch (err) {
      throw new Error(err.message)
    }
  }
}

module.exports = Text
