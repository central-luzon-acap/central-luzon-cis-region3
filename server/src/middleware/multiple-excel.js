const multer = require('multer')
const path = require('path')
const fs = require('fs')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create or reuse a dynamic temporary directory matching a signed-in user's uid
    const downloadPath = path.resolve(__dirname, '..', '..', 'temp', req.user.uid, req.randomToken)

    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath, { recursive: true }, (err) => {
        if (err) {
          console.log(err)
          return false
        } else {
          console.log(`Created a temp directory on\n${downloadPath}`)
          return true
        }
      })
    }

    cb(null, downloadPath)
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

// multer settings for multiple excel files upload.
// Requires the validFirebaseToken middleware
const multipleExcelFiles = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  fileFilter: (req, file, cb) => {
    const mimeTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
    if (mimeTypes.includes(file.mimetype)) {
      if (/^(day)([1-9]|10).xlsx$/.test(file.originalname)) {
        cb(null, true)
      } else {
        req.fileValidationError = 'Invalid file naming convention.'
        return cb(null, false, req.fileValidationError)
      }
    } else {
      req.fileValidationError = 'Only Excel files (.xlsx) file format allowed.'
      return cb(null, false, req.fileValidationError)
    }
  }
}).array('excel-files', 10)

module.exports = multipleExcelFiles
