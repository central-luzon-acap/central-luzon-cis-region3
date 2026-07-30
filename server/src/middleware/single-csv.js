const multer = require('multer')
const path = require('path')
const fs = require('fs')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create or reuse a dynamic temporary directory matching a signed-in user's uid
    const downloadPath = path.resolve(__dirname, '..', '..', 'temp', req.user.uid)

    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath)
    }

    cb(null, downloadPath)
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

// multer settings for single CSV file upload.
// Requires the validFirebaseToken middleware

const singleCSVFile = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB File size limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'text/csv') {
      cb(null, false)
      const error = new Error('Only CSV files (.csv) file format allowed.')
      error.name = 'ExtensionError'
      return cb(error)
    }
    cb(null, true)
  }
}).single('csvFile')

module.exports = singleCSVFile
