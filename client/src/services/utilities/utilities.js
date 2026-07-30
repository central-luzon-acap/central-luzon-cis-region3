import FirestoreService from '@/utils/firestoreutils'
import { ref, storage, getDownloadURL } from '@/firebase/firebase.config'
import { PDF_BULLETINS } from '@/utils/constants'
import { REPORT_TYPE } from '@/utils/constants/app'

export const _Utilities = {
  MEDIA_ASSETS: 'n_page_media',
  ASSETS: 'n_page_assets',
  PAGE_SEARCH: 'n_page_search',
  GLOBAL_COLLECTIONS: 'w_services',
  TYPHOON_ADVISORY: 'typhoon_advisory',
  CYCLONE_ADVISORY: 'cyclone_advisory'
}

export class Utilities extends FirestoreService {
  /**
   * Get the list of assets download URL
   * @param {String} group - 1st level Firestore document name
   * @param {String} page - Filter field in the Firestore document
   * @param {Bool} all
   *    - Returns a String[] of download URLs if false
   *    - Returns an Object[] of download URLs and other data if true
   * @returns {String[]} - Array of assets download URL links
   * @returns {Object[]} - Array of objects with assets download URL link and other info
   */
  getPageAssetsDoc = async (group, page, all = false) => {
    let res = []

    try {
      res = await this.getDocumentData(_Utilities.ASSETS, group)

      if (!res) {
        return []
      }

      if (!page) {
        return res
      }

      if (all) {
        return res.data.filter(x => x.page === page)
      } else {
        return res.data.filter(x => x.page === page).map(x => x.url)
      }
    } catch (err) {
      console.error(err.message)
      throw new Error(err.message)
    }
  }

  // Fetch the Typhoon Advisory data
  getTyphoonAdvisory = async () => {
    const docRef = this.doc(this.db, _Utilities.GLOBAL_COLLECTIONS, _Utilities.TYPHOON_ADVISORY)
    const docSnap = await this.getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data()
    }

    return null
  }

  getWeatherForecast = async (region, type) => {
    return await this.getNestedCollectionData(_Utilities.WEATHER_FORECASTS, region, type, 'name')
  }

  getPdfDownloadURL = async (filename, type = REPORT_TYPE.SEASONAL) => {
    let path = ''

    switch (type) {
      case REPORT_TYPE.SEASONAL:
        path = PDF_BULLETINS.PDF_STORAGE_SEASONAL
        break
      case REPORT_TYPE.TEN_DAY:
        path = PDF_BULLETINS.PDF_STORAGE_TENDAY
        break
      case REPORT_TYPE.SPECIAL_WEATHER:
        path = PDF_BULLETINS.PDF_STORAGE_SPECIAL
        break
      default:
        break
    }

    try {
      const pdfRef = ref(storage, `${path}/${filename}`)
      return await getDownloadURL(pdfRef)
    } catch (err) {
      throw new Error(err.message)
    }
  }
}
