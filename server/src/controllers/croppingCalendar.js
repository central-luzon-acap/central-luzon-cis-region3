const path = require('path')
const calendarprocess = require('../scripts/seeders/12_cropping_calendar/lib/calendarprocess')
const createDefaultCalendarData = require('../scripts/seeders/12_cropping_calendar/lib/defaultcalendardata')
const { uploadToFirestore, addCropToCropList, deleteCollection } = require('../scripts/seeders/lib/uploadtofirestore')
const { delFile } = require('../utils/file')
const { FIRESTORE_COLLECTIONS } = require('../utils/constants')
const {
  WEATHER_DATASOURCE
} = require('../scripts/seeders/12_cropping_calendar/lib/calendarinit')

const { ExcelFile } = require('../scripts/pagasaexcel/classes')

const CroppingCalendar = require('../scripts/seeders/12_cropping_calendar/classes/cropcalendar')

const createCroppingCalendar = async (req, res, next) => {
  try {
    const calendarFilePath = path.join(__dirname, 'empty_cropping_calendar.csv')
    const response = await createDefaultCalendarData(calendarFilePath)
    if (response) {
      await calendarprocess({
        weathersource: WEATHER_DATASOURCE.LOCAL_FILE,
        calendarfile: calendarFilePath,
        upload: true,
        write: true,
        firestoreCollection: 'CROPPING_CALENDAR_DYNAMO'
      })
    }
  } catch (err) {
    console.log(err.message)
  }
}

const uploadCroppingCalendar = async (req, res, next) => {
  try {
    const { cropName } = req.params

    if (!cropName) {
      res.send({ message: 'Missing crop input.' })
      return
    }

    const calendarfilePath = req.file.path

    let calendar = {}
    calendar = new CroppingCalendar({ csvFilePath: calendarfilePath })
    await calendar.readCSV()

    if (calendar.data().length > 0) {
      try {
        const query = []
        const calendargroup = calendar.groupByProvince()

        for (const province in calendargroup) {
          const data1 = []
          const data2 = []

          for (let i = 0; i < calendargroup[province].length; i += 2) {
            data1.push(calendargroup[province][i])
            data2.push(calendargroup[province][i + 1])
          }

          query.push(
            uploadToFirestore(
              `${FIRESTORE_COLLECTIONS.CROPPING_CALENDAR_X}/calendar/${cropName}`,
              province,
              { data: { data1, data2 } }
            )
          )
        }

        res.send({ message: 'Uploaded Cropping Calendar' })
        await Promise.all(query)
      } catch (err) {
        console.log(err.message)
      }
    }
  } catch (err) {
    console.log(err.message)
  }
}

const uploadCroppingCalendarExcel = async (req, res, next) => {
  try {
    const { cropName } = req.params

    if (!cropName) {
      res.send({ message: 'Missing crop input.' })
      return
    }

    const excelFilePath = req.file.path

    const excelFile = new ExcelFile(excelFilePath)

    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    const query = []

    // Upload Sheet 1 data: Cropping Calendar
    const data = excelFile.getDataSheet(0)
    const convertedExcelData = data.map((row) => {
      const municipalityObject = {}
      for (let i = 1; i <= 12; i++) {
        const mdata = []
        const index = (i < 10) ? `0${i}` : i
        const m1 = row[`${index}_15_CAL`] !== undefined ? row[`${index}_15_CAL`].split('_')[0].trim() : ''
        const m2 = row[`${index}_30_CAL`] !== undefined ? row[`${index}_30_CAL`].split('_')[0].trim() : ''

        const firstHalf = (m1 === '') ? 'none' : m1
        mdata.push(firstHalf)
        const secondHalf = (m2 === '') ? 'none' : m2
        mdata.push(secondHalf)

        municipalityObject[months[i - 1]] = mdata.toString()
        municipalityObject.crop = row.crop
        municipalityObject.municipality = row.muni
        municipalityObject.province = row.prov
      }

      return municipalityObject
    })

    const calendargroup = convertedExcelData.reduce((group, row) => {
      const province = row.province.trim()

      if (group[province] === undefined) {
        group[province] = []
      }

      const obj = { province }

      for (const key in row) {
        if (!['id', 'province'].includes(key)) {
          obj[key] = row[key].trim()
        }
      }

      group[province].push(obj)
      return { ...group }
    }, {})

    let isValidMunicipalities = true

    for (const province in calendargroup) {
      const municipalities = calendargroup[province].map(item => item.municipality)
      const uniqueMunicipalities = new Set(municipalities)

      // Each municipality should have 2 cropping calendar rows (data1, data2)
      const notEqual = uniqueMunicipalities.size * 2 !== municipalities.length

      if (notEqual) {
        isValidMunicipalities = false
        break
      }
    }

    // Throw error to avoid uploading/processing data with errors further
    if (!isValidMunicipalities) {
      throw new Error('Missing data1 or data2 municipality row')
    }

    for (const province in calendargroup) {
      const data1 = []
      const data2 = []

      for (let i = 0; i < calendargroup[province].length; i += 2) {
        data1.push(calendargroup[province][i])
        data2.push(calendargroup[province][i + 1])
      }

      query.push(
        uploadToFirestore(
          `${FIRESTORE_COLLECTIONS.CROPPING_CALENDAR_X}/calendar/${cropName}`,
          province,
          { data: { data1, data2 } }
        )
      )
    }

    // Upload Sheet 2 data: Crop Stages
    const cropStages = excelFile.getDataSheet(1)

    const cropStagesObject = {}
    cropStages.forEach((stage, index) => {
      cropStagesObject[stage.Code] = {
        label: stage.Crop_Stage,
        code: stage.Code,
        index
      }
      return cropStagesObject
    })

    query.push(
      uploadToFirestore(
        `${FIRESTORE_COLLECTIONS.CROPPING_CALENDAR_X}/calendar/${cropName}`,
        'stages',
        { data: cropStagesObject }
      )
    )

    // Upload Sheet 3 data: Cropping Calendar Seasonal
    const dataSeasonal = excelFile.getDataSheet(2)

    if (dataSeasonal.length === 0) {
      query.push(
        deleteCollection(
          `${FIRESTORE_COLLECTIONS.CROPPING_CALENDAR_SEASONAL_X}/calendar/${cropName}`
        )
      )
    } else {
      const convertedExcelDataSeasonal = dataSeasonal.map((row) => {
        const provinceObject = {}
        for (let i = 1; i <= 12; i++) {
          const mdata = []
          const index = (i < 10) ? `0${i}` : i
          const m1 = row[`${index}_15_CAL`] !== undefined ? row[`${index}_15_CAL`].split('_')[0].trim() : ''
          const m2 = row[`${index}_30_CAL`] !== undefined ? row[`${index}_30_CAL`].split('_')[0].trim() : ''

          const firstHalf = (m1 === '') ? 'none' : m1
          mdata.push(firstHalf)
          const secondHalf = (m2 === '') ? 'none' : m2
          mdata.push(secondHalf)

          provinceObject[months[i - 1]] = mdata.toString()
          provinceObject.crop = row.crop
          provinceObject.province = row.prov
        }

        return provinceObject
      })

      const calendargroupSeasonal = convertedExcelDataSeasonal.reduce((group, row) => {
        const province = row.province.trim()

        if (group[province] === undefined) {
          group[province] = []
        }

        const obj = { province }

        for (const key in row) {
          if (!['id', 'province'].includes(key)) {
            obj[key] = row[key].trim()
          }
        }

        group[province].push(obj)
        return { ...group }
      }, {})

      for (const province in calendargroupSeasonal) {
        const data1 = []
        const data2 = []

        for (let i = 0; i < calendargroupSeasonal[province].length; i += 2) {
          data1.push(calendargroupSeasonal[province][i])
          data2.push(calendargroupSeasonal[province][i + 1])
        }

        query.push(
          uploadToFirestore(
            `${FIRESTORE_COLLECTIONS.CROPPING_CALENDAR_SEASONAL_X}/calendar/${cropName}`,
            province,
            { data: { data1, data2 } }
          )
        )
      }
    }

    // Upload Sheet 4 data: Crop Stages Seasonal
    const cropStagesSeasonal = excelFile.getDataSheet(3)

    if (cropStagesSeasonal.length === 0) {
      query.push(
        deleteCollection(
          `${FIRESTORE_COLLECTIONS.CROPPING_CALENDAR_SEASONAL_X}/calendar/${cropName}`
        )
      )
    } else {
      const cropStagesSeasonalObject = {}
      cropStagesSeasonal.forEach((stage, index) => {
        cropStagesSeasonalObject[stage.Code] = {
          label: stage.Crop_Stage,
          code: stage.Code,
          index
        }
        return cropStagesSeasonalObject
      })

      query.push(
        uploadToFirestore(
          `${FIRESTORE_COLLECTIONS.CROPPING_CALENDAR_SEASONAL_X}/calendar/${cropName}`,
          'stages',
          { data: cropStagesSeasonalObject }
        )
      )
    }

    query.push(
      addCropToCropList(
        `${FIRESTORE_COLLECTIONS.CROPPING_CALENDAR_X}`,
        cropName
      )
    )

    await Promise.all(query)

    const data1Full = convertedExcelData.reduce((list, item) => {
      if (
        !list.find(x =>
          x.province === item.province &&
          x.municipality === item.municipality)
      ) {
        return [...list, item]
      }

      return list
    }, [])

    // Sync mismatching crop calendar municipality names with PAGASA 10-day weather forecast municipality names
    // This script disables municipality names from dropdown menus in the UI
    await calendarprocess({
      weathersource: WEATHER_DATASOURCE.DATABASE,
      calendarData: data1Full,
      upload: true
    })

    // Clean-up: Delete uploaded file
    await delFile(excelFilePath)

    return res.send({ message: 'Uploaded Cropping Calendar' })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  createCroppingCalendar,
  uploadCroppingCalendar,
  uploadCroppingCalendarExcel
}
