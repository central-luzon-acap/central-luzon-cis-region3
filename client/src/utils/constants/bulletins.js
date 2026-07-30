const PDF_BULLETINS = {
  // Crop Recommendations Bulletins (logs)
  PDF_CROPS: 'bulletins_pdf_crops',

  // Crop Recommendations Bulletins (logs)
  PDF_CROPS_TENDAY: 'bulletins_pdf_tenday',

  // Crop Recommendations Bulletins (logs)
  PDF_CROPS_SPECIAL: 'bulletins_pdf_special',

  // Firebase Storage bucket for 10-day bulletin PDFs
  PDF_STORAGE_TENDAY: 'bulletins_tenday',

  // Firebase Storage bucket for 10-day bulletin PDFs
  PDF_STORAGE_SPECIAL: 'bulletins_special',

  // Firebase Storage bucket for seasonal bulletin PDFs
  PDF_STORAGE_SEASONAL: 'bulletins'
}

const BULLETIN_ACTION = {
  DELETE: 'delete',
  DOWNLOAD: 'download',
  IDLE: 'idle'
}

const DEFAULT_SELECTED_BULLETIN = {
  action: BULLETIN_ACTION.IDLE,
  type: '', // One of REPORT_TYPE
  collection: PDF_BULLETINS.PDF_CROPS,
  filename: '',
  province: '',
  keyword: ''
}

export {
  PDF_BULLETINS,
  BULLETIN_ACTION,
  DEFAULT_SELECTED_BULLETIN
}