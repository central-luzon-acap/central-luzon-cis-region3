/**
 * Flag the 10-day weather forecast "formatted" municipalities masterlist with "disabled" if they are missing in the cropping calendar municipalities list.
 * Inserts missing cropping calendar municipalities to the "formatted" municipalities masterlist with "iscalendar=true"
 * @param {Object[]} missmatching - List of missing/mismatching municipality names from the 10-day weather forecast and calendar data
 * @param {Object[]} formattedforecast - Formatted municipalities list reference for drop-down menus on UI
 * @returns { formatdata, rawdata }
 *    - formatdata: {Object} Calendar-municipalities synced formatted municipalities list
 *    - rawdata: {Object} Calendar-municipalities synced raw municipalities list
 */
const calendarsync = ({ missmatching, formattedforecast }) => {
  const formatdata = { ...formattedforecast }

  missmatching.forEach((item) => {
    const provinceIndex = formatdata.data.findIndex(x => x.label === item.province)

    if (provinceIndex >= 0) {
      const forecastIndex = formatdata.data[provinceIndex].municipalities.findIndex(x => x.label === item.municipality)

      if (forecastIndex >= 0) {
        // Disable for cropping calendar selections
        formatdata.data[provinceIndex].municipalities[forecastIndex].disabled = true
      } else if (forecastIndex === -1) {
        // Insert new municipality to match with cropping calendar municipalities
        formatdata.data[provinceIndex].municipalities.push({
          id: formatdata.data[provinceIndex].municipalities.length,
          label: item.municipality,
          disabled: false,
          iscalendar: true
        })
      }
    }
  })

  // Build the new raw municipalities data list
  // NOTE: This list replaces the static "region5_municipalities.json" data
  const rawdata = {
    metadata: { ...formatdata.metadata }
  }

  rawdata.data = formatdata.data.reduce((list, province) => {
    list[province.label] = province.municipalities.map(x => x.label)
    return list
  }, {})

  return { formatdata, rawdata }
}

module.exports = calendarsync
