const Text = require('./text')
const t = new Text()

const sendSmsRecommendations = t.sendSmsRecommendations.bind(t)

module.exports = {
  sendSmsRecommendations
}
