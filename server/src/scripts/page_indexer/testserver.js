const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 3002

app.use(express.static(path.resolve(__dirname, 'app')))
app.get('*', (req, res) => {
  return res.sendFile(path.resolve(__dirname, 'app', 'index.html'))
})

module.exports = app.listen(PORT, () => {
  console.log(`local server listening on http://localhost:${PORT}`)
})
