const fs = require('fs')
const path = require('path')
const { DOWNLOAD_DIR } = require('../../scripts/cron/update_tenday_weather/lib/constants')

/**
 * Asynchronously deletes a directory and all file/directory contents recursively
 * @param {String} dirPath - Full file path to a local directory
 */
const delDir = (dirPath) => {
  return new Promise((resolve, reject) => {
    fs.rm(dirPath, { recursive: true }, (err) => {
      if (err) {
        reject(new Error(err))
      } else {
        console.log(`Deleted directory ${dirPath}\n`)
        resolve(true)
      }
    })
  })
}

/**
 * Create a directory recursively creating paths before it if they don't exist
 * @param {String} dirPath - Full file path to a local directory
 */
const createDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true }, (err) => {
      if (err) {
        console.log(err)
        throw new Error(err.message)
      } else {
        console.log(`Created a temp directory on\n${dirPath}`)
        return true
      }
    })

    return true
  } else {
    console.log(`Skippping, directory already exists:\n${dirPath}`)
    return false
  }
}

/**
 * Create a random temporary directory
 * @returns {String} Full directory path of the created directory
 */
const createTempDir = () => {
  const now = new Date()
  const tempDir = `${Math.random().toString(36).replace(/[0-9]/g, '').substring(2)}${now.getMilliseconds()}`
  const dirPath = path.resolve(__dirname, '..', '..', '..', DOWNLOAD_DIR, tempDir)

  console.log(`Creating a temporary download directory: \n${dirPath}`)
  const directoryPath = createDir(dirPath) ? dirPath : undefined

  return directoryPath
}

module.exports = {
  createTempDir,
  createDir,
  delDir
}
