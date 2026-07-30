const Bulletin = require('./bulletin')
const PDF = new Bulletin()

const createbulletin = PDF.createbulletin.bind(PDF)
const deletebulletin = PDF.deletebulletin.bind(PDF)
const getPDFStorageFolderName = PDF.getPDFStorageFolderName.bind(PDF)
const getDocumentNameFromFilename = PDF.getDocumentNameFromFilename.bind(PDF)

module.exports = {
  createbulletin,
  deletebulletin,
  getPDFStorageFolderName,
  getDocumentNameFromFilename
}
