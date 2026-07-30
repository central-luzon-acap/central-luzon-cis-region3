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

// multer settings for multiple excel files upload.
// Requires the validFirebaseToken middleware
const singleExcelFile = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB File size limit
  fileFilter: (req, file, cb) => {
    const mimeTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
    if (mimeTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(null, false)
      const error = new Error('Only Excel files (.xlsx) file format allowed.')
      error.name = 'ExtensionError'
      return cb(error)
    }
  }
}).single('excelfile')

module.exports = singleExcelFile
