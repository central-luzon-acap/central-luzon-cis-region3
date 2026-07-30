import axios from 'axios'
import { useState, useEffect } from 'react'
import { getPdfDownloadURL } from '@/services/utilities'
import { ADAPTER_STATES } from '@/store/constants'
import { BULLETIN_ACTION } from '@/utils/constants/bulletins'

const defaultState = { loading: false, error: '', status: ADAPTER_STATES.IDLE, url: '' }

/**
 * Downloads the PDF file of a Bulletin document from Firebase Storage
 * @param {String} filename - Full PDF file name
 * @param {String} type - Bulletin type. One of REPORT_TYPE
 * @param {String} action - User action on a Bulletin item. One of BULLETIN_ACTION (DOWNLOAD, DELETE)
 * @param {Object} urlsegment - Bulletin-specific folder names to parse from the full Firebase storage downloadURL of a PDF file
 *    - keyword: {String} Firebase Storage folder name where the PDF file is kept, with an ending "%2F" string, i.e: "bulletins%2F"
 *    - charlength: {Number} urlsegment.keyword string length
 * @returns {Object} Deletion status logs
 *    - loading: {Bool} Bulletin is downloading
 *    - error: {String} PDF download or code processing errors
 *    - status: {String} Text description of the download status. One of ADAPTER_STATES
 */
export default function useDownloadPDF ({ filename, type, urlsegment, action }) {
  const [state, setState] = useState(defaultState)

  useEffect(() => {
    const downloadPDF = async () => {
      try {
        // Set the loading status
        setState(prev => ({
          ...prev,
          loading: true,
          error: '',
          url: '',
          status: ADAPTER_STATES.PENDING
        }))

        // Download PDF from URL
        const url = await getPdfDownloadURL(filename, type)
        const response = await axios.get(url, { responseType: 'blob' })

        // Download file from blob
        const a = url.substring(url.indexOf(urlsegment.keyword) + urlsegment.charlength, url.length)
        const documentName = a.substring(0, a.indexOf('?'))

        const pdfurl = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')

        link.href = pdfurl
        link.setAttribute('download', decodeURI(documentName))
        document.body.appendChild(link)
        link.click()

        document.body.removeChild(link)

        // Reset the loading status
        setState(prev => ({
          ...prev,
          loading: false,
          url,
          status: ADAPTER_STATES.FULLFILLED
        }))
      } catch (err) {
        setState(prev => ({
          ...prev,
          loading: false,
          url: '',
          error: err?.response?.data || err.message,
          status: ADAPTER_STATES.IDLE
        }))
      }
    }

    if (filename && action === BULLETIN_ACTION.DOWNLOAD) {
      downloadPDF()
    }
  }, [filename, type, urlsegment, action])

  return { state }
}
