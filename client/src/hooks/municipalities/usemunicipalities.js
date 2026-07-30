import { useState, useEffect } from 'react'

/**
 * Return the formatted municipalities list of a province
 * @param {String} province - Province name
 * @param {Object[]} provinceList - List of provinces with municipalities
 * @returns {Object[]} List of municipalites under a province following the format { id, label, disabled }
 */
export default function useMunicipalities (provinceName, provinceList) {
  const [municipalites, setMunicipalities] = useState([])

  useEffect(() => {
    setMunicipalities((!provinceName || !provinceList)
      ? []
      : provinceList.find(province => province.label === provinceName)?.municipalities ?? [])
  }, [provinceName, provinceList])

  return municipalites
}
