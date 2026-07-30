import { useState, useEffect } from 'react'

/**
 * Return the unique crops list of a municipality
 * @param {String} cropCalProvince - Cropping calendar data of a province
 * @param {String} municipality - Municipality name
 * @returns {Object[]} List if unique crops in [{ id, label, disabled },...] format. Each crop is disabled: false by default.
 *    - id: {Number} Unique ordinal local ID
 *    - label: {String} Crop name
 *    - disabled: {Bool} Flag if it has crop stages and enabled in the selection options
 */
export default function useCrops (cropCalProvince, municipality) {
  const [crops, setCropsList] = useState([])

  useEffect(() => {
    if (cropCalProvince && municipality) {
      const cropslist = (!cropCalProvince || !municipality)
        ? []
        : cropCalProvince
            .filter(record => record.municipality === municipality)
            .map(record => record.crop)
            .filter((x, i, a) => a.indexOf(x) === i)
            .map((item, id) => ({ id, label: item, disabled: false }))

      // Crops should have recommendations
      setCropsList(cropslist)
    }

    if (!municipality) {
      setCropsList([])
    }
  }, [cropCalProvince, municipality])

  return crops
}
