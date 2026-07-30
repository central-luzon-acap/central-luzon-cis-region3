import { useState, useEffect } from 'react'

/**
 * Return the provinces and municipalities list with only the selected cyclone (wind speed) affected items enabled.
 * @param {String} windsignaldata - Admin-encoded wind signal data
 * @param {Object[]} cyclonedata - Web-scraped tropical cyclone data
 * @param {Object[]} provinces - Province list each object (row) containing a list of municipalities,
 *    - i.e.: [{ id: 0, label: "Albay", municipalities: [{ id: 0, label: "Tiwi" },... ] },... ]
 * @param {Object} signal - User-selected PAGASA wind signal dropdown menu item
 * @returns {Object[]} A modified version of the provinces parameter with "disabled" property attached to the province and municipality items
 */
export default function useMunicipalitiesAffected (windsignaldata, cyclonedata, provinces, signal) {
  const [affectedprovinces, setProvinces] = useState([])

  useEffect(() => {
    if (
      windsignaldata?.data &&
      cyclonedata?.data &&
      provinces.length > 0 &&
      signal !== null
    ) {

      // List of affected provinces
      const affProvinces = windsignaldata.data
        .filter(item => item.signal === signal?.value)
        .map(item => item.province)
        .filter((x, i, a) => a.indexOf(x) === i)

      // List of affected municipalities grouped by province
      const affMunicipalities = windsignaldata.data
        .reduce((list, item) => {
          if (list[item.province] === undefined) {
            list[item.province] = []
          }

          list[item.province] = [ ...list[item.province], ...item.municipalities ]
          return { ...list }
        }, {})

      // TO-DO: Investigate deep copy is not working
      const a = [ ...provinces ]

      // Set the disabled propery on the provinces and municipalities list
      a.forEach((province) => {
        province.disabled = (!affProvinces.includes(province.label))

        province.municipalities.forEach((municipality) => {
          const indexOfMunicipality = windsignaldata.data
            .findIndex(item => item.province === municipality.province && item.municipalities.includes(municipality.label))

          // Set the disabled and signal properties
          if (!province.disabled) {
            municipality.disabled = (!affMunicipalities[province.label].includes(municipality.label))
            municipality.signal = (indexOfMunicipality > -1)
              ? windsignaldata.data[indexOfMunicipality].signal
              : 0
          } else {
            municipality.disabled = true
          }
        })
      })

      setProvinces(a)
    }
  }, [windsignaldata, cyclonedata, provinces, signal])

  return { affectedprovinces }
}
