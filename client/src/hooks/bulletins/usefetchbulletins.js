import { useState, useEffect } from 'react'
import { getBulletins } from '@/services/bulletin'
import { getFirestoreDateTimeString } from '@/utils/date'
import { ADAPTER_STATES } from '@/store/constants'
import { BULLETIN_ACTION, DEFAULT_SELECTED_BULLETIN } from '@/utils/constants/bulletins'

const defaultState = { loading: false, error: '', status: ADAPTER_STATES.IDLE, random: '' }

/**
 * Fetch the the Bulletins documents and format them for displaying the in PDFList component
 * @param {Object} currentbulletin - Current selected (clicked) Bulletin item information
 *    - action: {String} User action on a Bulletin item. One of BULLETIN_ACTION (DOWNLOAD, DELETE)
 *    - collection: {String} Bulletins Firestore collection name
 *    - filename: {String} Full PDF file name
 *    - province: Province where the Bulletin item belongs to
 *    - keyword: {String} Firebase Storage folder name where the PDF file is kept, with an ending "%2F" string, i.e: "bulletins%2F"
 * @param {Object} statdload - PDF dowload status information from usedownloadpdf() i.e., { loading, error, status }
 * @param {Object} statdelete - PDF deletion status information from usedeletebulletin() i.e., { loading, error, status }
 * @param {Bool} fetch - Flag for fetching the Bulletins documents
 * @returns {Object} { state, bulletins }
 *    - state: {Object} All Bulletins Firestore documents download status logs { loading, status, error }
 *    - bulletins: {Object} Bulletins Firestore documents grouped by province
 */
export function useFetchBulletins ({ currentbulletin, statdload, statdelete, fetch }) {
  const [state, setState] = useState(defaultState)
  const [bulletins, setBulletins] = useState({})
  const [cacheBulletin, setCache] = useState(DEFAULT_SELECTED_BULLETIN)
  const [isLoadingBulletin, setIsLoadingBulletin] = useState(false)
  const [shouldUpdate, setShouldUpdate] = useState(false)
  const [itemError, setItemError] = useState('')

  useEffect(() => {
    // Fetch and format the Bulletins documents on page load or after deleting Bulletins
    let mounted = true

    const loadBulletins = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: '', status: ADAPTER_STATES.PENDING }))
        const documents = await getBulletins(currentbulletin.collection)
        const bulletinsByProv = {}

        documents.forEach((item) => {
          if (bulletinsByProv[item.province] === undefined) {
            bulletinsByProv[item.province] = []
          }

          bulletinsByProv[item.province].push({
            province: item.province,
            filename: item.filename,
            date_created: getFirestoreDateTimeString(item.date_created),
            loading: false,
            error: ''
          })
        })

        if (mounted) {
          setBulletins(bulletinsByProv)
          setState(prev => ({ ...prev, loading: false, error: '', status: ADAPTER_STATES.FULLFILLED }))
        }
      } catch (err) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: err?.response?.data || err.message,
            status: ADAPTER_STATES.IDLE
          }))
        }
      }
    }

    if (fetch && mounted) {
      loadBulletins()
    }

    return () => {
      mounted = false
    }
  }, [fetch, currentbulletin.collection])

  useEffect(() => {
    // Consolidate an item's loading (deleting or downloading) status
    const loading = (statdload.status === ADAPTER_STATES.PENDING || statdelete.status === ADAPTER_STATES.PENDING)

    // The bulletins list should update only once after detecting a change in loading status
    setShouldUpdate(isLoadingBulletin !== loading)
    setIsLoadingBulletin(loading)

    if (!loading) {
      // Consolidate an item's error message
      const error = (currentbulletin.action === BULLETIN_ACTION.DELETE)
        ? statdelete.error
        : statdload.error
      setItemError(error)
    }
  }, [statdload, statdelete, currentbulletin.action, isLoadingBulletin])

  useEffect(() => {
    const setFileLoadingStats = (params) => {
      const { province, filename } = params
      const temp = [ ...bulletins[province]]
      const index = temp.findIndex(x => x.filename === filename)

      if (index >= 0) {
        temp[index].loading = isLoadingBulletin
        temp[index].error = itemError

        setBulletins(prev => ({ ...prev, [province]: [ ...temp] }))
        setItemError('')
        setShouldUpdate(false)
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Index not found.',
          status: ADAPTER_STATES.IDLE
        }))
      }
    }

    // Set the current bulletin's cache (previous value)
    if (currentbulletin.province !== '' && currentbulletin.filename !== '') {
      setCache(currentbulletin)
    }

    // Set an item's final loading stats and errors after detecting a change from loading to not loading & vice-versa only once
    if (shouldUpdate) {
      const targetbulletin = (currentbulletin.filename !== '')
        ? { ...currentbulletin }
        : { ...cacheBulletin }

      if (targetbulletin.filename !== '') {
        setFileLoadingStats({
          province: targetbulletin.province,
          filename: targetbulletin.filename,
          loading: isLoadingBulletin
        })
      }
    }
  }, [isLoadingBulletin, currentbulletin, cacheBulletin, bulletins, itemError, shouldUpdate])

  return { state, bulletins }
}
