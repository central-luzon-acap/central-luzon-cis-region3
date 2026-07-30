const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3001

const { router, routerShared } = require('./controllers')
const { corsOptions } = require('./utils/whitelist-cors')
const { logOsInfo } = require('./utils/os-info')
const { logServerErrorInfo } = require('./utils/server-error-log')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.resolve(__dirname, 'public')))

console.log(`[LOG] ALLOW_CORS: ${process.env.ALLOW_CORS}`)
console.log(`[LOG] ALLOWED_ORIGINS: ${process.env.ALLOWED_ORIGINS}`)

// CORS-enabled routes with ALL domains
if (process.env.IS_RMCAS_API_ACTIVE === '1') {
  app.get('/api/weatherforecast*', cors({ origin: '*' }), routerShared)
}

// CORS-enabled routes with whitelisted domains
if (process.env.ALLOW_CORS === '1') {
  console.log('[LOG]: Use CORS')
  app.use(cors(corsOptions))
}

app.use('/api', router)

const publicRootPage = (process.env.DEPLOYMENT_PLATFORM === 'vercel')
  ? path.resolve(__dirname, '..', 'public', 'index.html')
  : path.resolve(__dirname, 'public', 'index.html')

if (process.env.DEPLOYMENT_PLATFORM === 'vercel') {
  app.get('/api', (req, res) => {
    return res.sendFile(publicRootPage)
  })
}

app.get('*', (req, res) => {
  return res.sendFile(publicRootPage)
})

app.use((err, req, res, next) => {
  const origin = req.get('origin') ?? 'unknown origin'

  logServerErrorInfo({
    error: err,
    user: req.user,
    origin,
    route: req?.url ?? '-'
  })

  return res.status(500).send(err.message)
})

// Runs the Express server by listening to a PORT
// If the deployment platform is "vercel", server routes load from the /api directory as a "standalone Express" app
if (process.env.DEPLOYMENT_PLATFORM !== 'vercel') {
  app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`)
    logOsInfo()
  })
}

module.exports = app
