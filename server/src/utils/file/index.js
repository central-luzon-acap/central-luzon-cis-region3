const fs = require('fs')

/**
 * Asynchronously deletes a file on local storage
 * @param {String} filePath - Full local file path to a target file
 */
const delFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log(err)
        reject(new Error(err))
      } else {
        console.log(`Deleted file ${filePath}\n`)
        resolve(true)
      }
    })
  })
}

module.exports = {
  delFile
}
