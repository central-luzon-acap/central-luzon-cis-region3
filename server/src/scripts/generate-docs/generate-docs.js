require('dotenv').config()
const fs = require('fs')
const path = require('path')

const PREFIX = 'GEN-DOCS'

/**
 * Capitalizes the first letter of a word
 * @param {String} word - Single word or text
 * @returns {String} Input word parameter with capitalized first letter
 */
const capitalizeWord = (word) => word.split('').map((x, index) => index === 0 ? x.toUpperCase() : x).join('')

/**
 * Finds the API doc's build output directory
 * @param {Bool} isVercel Flag indicating if the server deployment's target platform is Vercel
 * @param {String} directory Target folder under the API docs path
 * @returns
 */
const getDocBuildDirectory = (isVercel = false, directory = 'files') => {
  return !isVercel
    ? path.resolve(__dirname, '..', '..', 'public', 'docs', directory)
    : path.resolve(__dirname, '..', '..', '..', 'public', directory)
}

/**
 * Creates an "apidoc.json" file in this script's root directory and replaces api dpc text content
 * with appropriate values from environment variables
 * @param {Bool} isRcmasActive Flag that indicates the active/deactivated status of the ACAP-RCMAS API
 * @param {String} baseApiURL - Base API URL to display in the API docs
 * @returns
 * @throws {Error} File parsing/write errors
 */
const initializeApiDocConfig = (isRcmasActive = false, baseApiURL) => {
  try {
    console.log(`[${PREFIX}]: Generating the apidoc.json file...`)

    // File paths
    const apiDocPath = path.resolve(__dirname, 'config', 'apidoc.json')
    const headerNormalPath = path.resolve(__dirname, 'templates', 'header.md')
    const headerRcmasPath = path.resolve(__dirname, 'templates', 'header_active_rcmas.md')
    const headerRcmasVercelPath = path.resolve(__dirname, 'templates', 'header_active_rcmas_vercel.md')
    const headerFinal = path.resolve(__dirname, 'templates', 'header_final.md')

    // Read api doc config file
    let apiDocConfig = fs.readFileSync(apiDocPath, 'utf-8')

    // api doc config file: Replace the base API URLs
    apiDocConfig = apiDocConfig.replace(/{{http:\/\/API_URL}}/g, `${baseApiURL}/api`)

    // api doc config file: Replace all region name
    const regionName = (process.env.REGION_NAME || '')
      .split('_')
      .map(x => capitalizeWord(x))
      .join(' ')

    apiDocConfig = apiDocConfig.replace(/{{REGION_NAME}}/g, regionName ?? '')

    // api doc config file: Replace the header content
    apiDocConfig = apiDocConfig.replace(/{{HEADER_MARKDOWN_FULL_PATH}}/g,
      'src/scripts/generate-docs/templates/header_final.md'
    )

    // api doc config file: Write to file
    fs.writeFileSync(path.resolve(__dirname, 'apidoc.json'), apiDocConfig, 'utf-8')

    // Replace URLs in the markdown header file
    let headerFile = fs.readFileSync(headerNormalPath, 'utf-8')

    if (isRcmasActive) {
      if (process.env.DEPLOYMENT_PLATFORM === 'vercel') {
        headerFile = fs.readFileSync(headerRcmasVercelPath, 'utf-8')
      } else {
        headerFile = fs.readFileSync(headerRcmasPath, 'utf-8')
      }
    }

    // Replace common placeholders in the markdown header file
    headerFile = headerFile.replace(/{{LIVE_ORIGIN}}/g, `${process.env.LIVE_ORIGIN}`)
    headerFile = headerFile.replace(/{{http:\/\/API_URL}}/g, `${baseApiURL}`)
    headerFile = headerFile.replace(/{{http:\/\/RENDER_API_URL}}/g, `${process.env.ROOT_API_URL}`)
    headerFile = headerFile.replace(/{{REGION_NAME}}/g, regionName)

    // Write header to file
    fs.writeFileSync(headerFinal, headerFile, 'utf-8')
  } catch (err) {
    throw new Error(`confg - ${err?.response?.data ?? err.message}`)
  }
}

/**
 * Copies the ACAP-RCMAS APIs sample JSON responses to the API docs directory
 * @param {Bool} isVercel Flag indicating if the server deployment's target platform is Vercel
 */
const initializeApiSampleResponses = (isVercel = false) => {
  try {
    console.log(`[${PREFIX}]: Copying the API response JSON files...`)

    const sourceDir = path.resolve(__dirname, 'responses')
    const destinationDir = getDocBuildDirectory(isVercel, 'files')

    fs.mkdirSync(destinationDir, { recursive: true })
    const files = fs.readdirSync(sourceDir)

    files.forEach((file) => {
      const sourceFile = path.join(sourceDir, file)
      const destFile = path.join(destinationDir, file)
      fs.copyFileSync(sourceFile, destFile)
    })
  } catch (err) {
    throw new Error(`response setup - ${err?.response?.data ?? err.message}`)
  }
}

/**
 * Copies custom assets (images) to the API doc's build output directory
 * @param {Bool} isVercel Flag indicating if the server deployment's target platform is Vercel
 */
const initializeApiStaticAssets = (isVercel = false) => {
  try {
    console.log(`[${PREFIX}]: Copying the static assets...`)

    const sourceDir = path.resolve(__dirname, 'templates')
    const destinationDir = getDocBuildDirectory(isVercel, 'assets')

    fs.mkdirSync(destinationDir, { recursive: true })
    const files = fs.readdirSync(sourceDir)
    const assets = ['.png']

    files.forEach((file) => {
      const suffix = file.substring(file.length - 4, file.length)

      if (assets.includes(suffix)) {
        const sourceFile = path.join(sourceDir, file)
        const destFile = path.join(destinationDir, file)
        fs.copyFileSync(sourceFile, destFile)
      }
    })
  } catch (err) {
    throw new Error(`assets setup - ${err?.response?.data ?? err.message}`)
  }
}

/**
 * Replaces the API documentation's local server API URL with live, accessible API URL values
 * @param {String} baseApiURL - Base API URL to display in the API docs
 * @throws {Error} File parsing/write errors
 */
const initializeApiDocContent = (isRcmasActive = false, baseApiURL) => {
  try {
    console.log(`[${PREFIX}]: Updating the API base URLs...`)

    // Read the controllers file
    const docsPath = path.resolve(__dirname, '..', '..', 'controllers', 'index.js')
    let docsFile = fs.readFileSync(docsPath, 'utf-8')

    // Replace all API base URLs
    docsFile = docsFile.replace(/http:\/\/localhost:3001/g, baseApiURL)

    // Replace the ACAP-RCMAS acive/inactive text
    const message = !isRcmasActive
      ? '> <span style="color: orange;">🛈 This API endpoint is not yet activated.<span>'
      : ''

    docsFile = docsFile.replace(/{{INACTIVE_TEXT}}/g, message)

    fs.writeFileSync(path.resolve(__dirname, 'api.js'), docsFile, 'utf-8')
  } catch (err) {
    throw new Error(`api docs - ${err?.response?.data ?? err.message}`)
  }
}

/**
 * Generates the ACAP API Documentation
 */
const generateApiDocs = () => {
  try {
    const requiredVars = [
      process.env.REGION_NAME,
      process.env.LIVE_ORIGIN,
      process.env.ROOT_API_URL
    ]

    if (requiredVars.filter(item => !item).length > 0) {
      console.log(requiredVars)
      throw new Error('Missing docs variable')
    }

    if (
      process.env.DEPLOYMENT_PLATFORM === 'vercel' &&
      !process.env.ROOT_API_URL_VERCEL
    ) {
      throw new Error('Missing vercel docs variable')
    }

    const isActiveAPI = process.env.IS_RMCAS_API_ACTIVE === '1'

    const ROOT_API_URL = process.env.DEPLOYMENT_PLATFORM === 'vercel'
      ? process.env.ROOT_API_URL_VERCEL
      : process.env.ROOT_API_URL

    initializeApiDocConfig(isActiveAPI, ROOT_API_URL)
    console.log(`[${PREFIX}]: Initialized config and files\n`)

    initializeApiDocContent(isActiveAPI, ROOT_API_URL)
    console.log(`[${PREFIX}]: Initialized API base API URL text\n`)

    initializeApiSampleResponses(process.env.DEPLOYMENT_PLATFORM === 'vercel')
    console.log(`[${PREFIX}]: Copied the sample API response files\n`)

    initializeApiStaticAssets(process.env.DEPLOYMENT_PLATFORM === 'vercel')
    console.log(`[${PREFIX}]: Copied the static assets files\n`)
  } catch (err) {
    throw new Error(`[${PREFIX}-ERROR]: ${err?.response?.data ?? err.message}`)
  }
}

module.exports = generateApiDocs
