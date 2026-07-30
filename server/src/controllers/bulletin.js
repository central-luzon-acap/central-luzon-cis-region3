const { bucket } = require('../utils/db')
const {
  deletebulletin,
  getPDFStorageFolderName,
  getDocumentNameFromFilename
} = require('../classes/bulletin')

// Delete a Bulletin Firestore document and it's associated PDF file in Firebase Storage
const deleteBulletin = async (req, res, next) => {
  const { type, filename } = req.body

  if (!type || !filename) {
    return res.status(500).send('Missing parameters')
  }

  try {
    const STORAGE_PDF_FOLDER = getPDFStorageFolderName(type)
    const docname = getDocumentNameFromFilename(filename)

    // Delete the Bulletin document
    await deletebulletin({ type, docname })

    // Delete the PDF file
    await bucket.file(`${STORAGE_PDF_FOLDER}/${filename}`).delete({
      ignoreNotFound: true
    })

    return res.status(200).send(`${filename} deleted.`)
  } catch (err) {
    next(new Error(err))
  }
}

module.exports = {
  deleteBulletin
}
