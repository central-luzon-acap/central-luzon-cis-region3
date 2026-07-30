require('dotenv').config()

const REGION = process.env.REGION_NAME

const REGIONS = {
  BICOL: process.env.REGION_NAME
}

const PROVINCES = {
  [REGIONS.BICOL]: process.env.PROVINCES.split(',')
}

const DOWNLOAD_DIR = 'temp'

module.exports = {
  // REGIONS,
  REGION,
  PROVINCES,
  DOWNLOAD_DIR
}
