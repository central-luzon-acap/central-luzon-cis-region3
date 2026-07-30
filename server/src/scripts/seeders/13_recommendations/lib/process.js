require('dotenv').config()
const path = require('path')
const { CsvToFireStore } = require('csv-firestore')
const SeasonalTab = require('../classes/seasonaltab')
const TendayTab = require('../classes/tendaytab')
const SpecialTab = require('../classes/specialtab')
const { uploadToFirestore } = require('../../lib/uploadtofirestore')
const { extractExcelData } = require('./extract')
const { dataToCsv } = require('./tocsv')

/**
 * Parses, cleans, and normalize the final crop recommendations excel file containing crop recommendations data for seasonal, 10-day and special weather categories.
 * Valid recommendations text are written enclosed in HTML <ol>, <ul>, <li>, <span>, <p>, <strong>, <i> and <b> tags.
 * Uploads normalized data to Firestore path: /n_list_crop_recommendations/{type}.data[]
 * @param {String} localfile - Full file path to a local recommendations excel file
 * @param {String} logsdir - Full local directory path to put processing output logs
 * @param {Bool} upload - Upload extracted recommendations to Firestore. Default is true.
 * @param {Bool} write - Write output logs to CSV files in logsdir. Default is false.
 * @throws Data parsing, uploading and processing errors.
 */
module.exports.processRecommendations = async ({ localfile, logsdir, upload = true, write = false }) => {
  const data = []
  const query = []

  // Excel file path
  const filePath = localfile ?? path.join(__dirname, '..', '..', '..', 'data', 'mock_recommendations_html_v2.xlsx')
  const logsPath = logsdir ?? __dirname

  // Firestore documents upload handler
  const handler = new CsvToFireStore()

  // Excel tabs column names definitions
  const excelTabs = [
    new SeasonalTab(),
    new TendayTab(),
    new SpecialTab()
  ]

  try {
    // Extract data from excel sheet tabs
    console.log('Extracting data from excel sheets...')

    excelTabs.forEach((item, index) => {
      data.push(extractExcelData(item, filePath))
    })
  } catch (err) {
    throw new Error(`[ERROR]: ${err.message}`)
  }

  if (write) {
    // Write unique crop stages to CSV
    const uniqueStages = [...data[0].cropstages, ...data[1].cropstages, ...data[2].cropstages]
      .filter((x, i, a) => a.indexOf(x) === i)
      .reduce((list, item, index) => {
        list.push({ id: index + 1, name: item })
        return list
      }, [])

    // Write unique farm operations to CSV
    const uniqueActivities = [...data[0].farmoperations, ...data[1].farmoperations, ...data[2].farmoperations]
      .filter((x, i, a) => a.indexOf(x) === i)
      .reduce((list, item, index) => {
        list.push({ id: index + 1, name: item })
        return list
      }, [])

    dataToCsv(uniqueStages, path.join(logsPath, 'crop_stages.csv'))
    dataToCsv(uniqueActivities, path.join(logsPath, 'farm_operations.csv'))

    // Normalized crop recommendations data
    data.forEach(item => {
      dataToCsv(item.recommendations.data, path.join(logsPath, `n_list_crop_recommendations_${item.recommendations.type}.csv`))
    })
  }

  if (upload) {
    try {
      data.forEach((item, index) => {
        // Simple merged JSON data
        query.push(uploadToFirestore('n_list_crop_recommendations', item.recommendations.type, item.recommendations))

        // Upload each recommendation row to a Document
        // Path: /n_list_crop_recommendations_{type}
        query.push(handler.firestoreUpload(
          `n_list_crop_recommendations_${item.recommendations.type}`,
          true,
          item.recommendations.data
        ))
      })

      // Upload data to Firestore
      let logs = 'Extracted data:\n'
      data.forEach(item => {
        logs += `${item.recommendations.type}: ${item.recommendations.data.length} rows\n`
      })

      console.log(`${logs}\nUploading data to Firestore...`)
      await Promise.all(query)
      console.log('Data upload success!')
      process.exit(0)
    } catch (err) {
      throw new Error(`[ERROR]: ${err.message}`)
    }
  }
}
