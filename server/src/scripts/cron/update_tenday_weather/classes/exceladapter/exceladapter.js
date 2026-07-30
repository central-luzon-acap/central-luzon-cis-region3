const { ExcelFile } = require('ph-municipalities')
const { getforecastall } = require('../../../../../classes/tendayforecast')

/**
 * This class creates and updates the global municipalities list
 * with reference to PAGASA's latest 10-day weather forecast excel file municipalities list
 */
class ExcelAdapter extends ExcelFile {
  constructor ({ pathToFile, url }) {
    super({ pathToFile, url })
  }

  // Fetch the current 10-day weather forecast data from Firestore
  // Set it as the default datalist (read from Excel file)
  async fetchweathermunicipalities (regionName) {
    const response = await getforecastall(regionName)
    this.datalist = response.reduce((list, province) => {
      const obj = Object.keys(province.municipalities).map(municipality => ({ province: province.name, municipality }))
      return [
        ...list,
        ...obj
      ]
    }, [])
  }

  /**
   * Format raw data for the locations dataset to use on drop-down menus
   * @param {Object} municipalities - Province and municipalities data from this.listMunicipalities()
   * @returns
   */
  shaperegionlocationsdata ({ metadata, data }) {
    return {
      metadata,
      data: Object.keys(data).reduce((list, province, id) => {
        list.push({
          id,
          label: province,
          disabled: false,
          municipalities: data[province].map((label, id) => ({ id, label, disabled: false }))
        })
        return list
      }, [])
    }
  }

  /**
   * Format data into a long list of Object[]
   * @param {String[]} provinces - Provinces
   * @returns {Object[]} A subset of the data parameter containing only
   *    { id, province, municipality }
   */
  longlistmunicipalities = (provinces = []) => {
    return this.datalist
      .filter(x => (provinces.includes(x.province)))
      .map((item, id) => {
        return {
          id,
          province: item.province,
          municipality: item.municipality
        }
      })
  }

  /**
   * Get a String[] list of municipality names
   * @param {Object} data
   * @returns {String[]}
   */
  getmunicipalitieslist (data) {
    return Object.values(data).reduce((list, group) => ([...list, ...group]), [])
  }
}

module.exports = ExcelAdapter
