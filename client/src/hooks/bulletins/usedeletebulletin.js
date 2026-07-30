import { useState, useEffect } from 'react'
import { deleteBulletin, cancelAxiosRequest } from '@/services/bulletin'
import { ADAPTER_STATES } from '@/store/constants'
import { BULLETIN_ACTION } from '@/utils/constants/bulletins'

const defaultState = { loading: false, error: '', status: ADAPTER_STATES.IDLE }

/**
 * Deletes a Bulletin Firestore document and its associated PDF file on Firebase Storage
 * @param {String} type - Bulletin type. One of REPORT_TYPE
 * @param {String} filename - Full PDF file name
 * @param {String} action - User action on a Bulletin item. One of BULLETIN_ACTION (DOWNLOAD, DELETE)
 * @returns {Object} Deletion status logs
 *    - loading: {Bool} Bulletin is undergoing the deletion process
 *    - error: {String} Deletion or code processing errors
 *    - status: {String} Text description of the deletion status. One of ADAPTER_STATES
 */
export default function useDeleteBulletin ({ type, filename, action }) {
  const [state, setState] = useState(defaultState)

  useEffect(() => {
    return () => {
      cancelAxiosRequest('Aborting delete bulletin request')
    }
  }, [])

  useEffect(() => {
    const deletePDF = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: '', status: ADAPTER_STATES.PENDING }))
        await deleteBulletin({ type, filename })
        setState(prev => ({ ...prev, loading: false, error: '', status: ADAPTER_STATES.FULLFILLED }))
      } catch (err) {
        if (err.message !== 'Aborting delete bulletin request') {
          setState(prev => ({
            ...prev,
            loading: false,
            error: err?.response?.data || err.message,
            status: ADAPTER_STATES.IDLE
          }))
        }
      }
    }

    if (filename && action === BULLETIN_ACTION.DELETE) {
      deletePDF()
    }
  }, [filename, action, type])

  return { state }
}
