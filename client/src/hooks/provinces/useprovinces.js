import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProvinces } from '@/store/provinces/provinceThunks'
import { municipalitiesReceived } from '@/store/municipalities/municipalitySlice'
import { ADAPTER_STATES } from '@/store/constants'

/**
 * Fetches and sets the static province list if it's not yet already loaded.
 * Returns a list of municipalities associated with a province if the "province" parameter is provided.
 * @param {String} province - (Optional) Province name. Sets a local list of municipalities and dispatches a global list of municipalities if provided.
 * @returns {Object} { provinces, municipalities, error, loading }
 *    - provinces: {Object[]} List of provinces i.e.,
 *      [{ id: 0, label: "Albay" },...]
 *    - municipalities: {Object[]} List of municipalities for a specified province i.e.,
 *      [{ id: 0, label: "Tiwi" },...]
 *    - error: {String} Data loading or processing errors
 *    - loading: {Bool} Flag for on-going provinces data fetching
 */
export default function useProvinces (province) {
  const [provinces, setProvinces] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  const {
    ids,
    entities,
    municipalities: municipalitiesData,
    status,
    error: errProvinces } = useSelector((state) => state.provinces)

  useEffect(() => {
    if (ids.length === 0) {
      dispatch(fetchProvinces())
    } else {
      setProvinces(Object.values(entities))
      setMunicipalities([])
    }
  }, [dispatch, ids.length, entities])

  useEffect(() => {
    if (errProvinces !== '') {
      setError(errProvinces)
    }
  }, [errProvinces])

  useEffect(() => {
    setLoading(status === ADAPTER_STATES.PENDING)
  }, [status])


  useEffect(() => {
    if (province) {
      try {
        if (!Object.keys(municipalitiesData).includes(province)) {
          setError('Province has no municipalities')
          return
        }

        if (municipalitiesData[province].length === 0) {
          setError(`No municipalities found for ${province}`)
          return
        }

        setMunicipalities(municipalitiesData[province] || [])
        dispatch(municipalitiesReceived(municipalitiesData[province] || []))
      } catch (err) {
        setError(err.message)
      }
    }
  }, [dispatch, province, municipalitiesData])

  return { provinces, municipalities, loading, error }
}