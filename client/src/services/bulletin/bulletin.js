import axios from 'axios'
import RequestObject from '@/utils/requestobject'
import FirestoreService from '@/utils/firestoreutils'

export const _Bulletin = {
  DELETE_BULLETIN: `${process.env.BASE_API_URL}/bulletins`,
}

export class Bulletin extends RequestObject {
  FirestoreQuery = new FirestoreService()
  AxiosCancelSource = axios.CancelToken.source()

  /**
   * Deletes a Bulletin Firestore document
   * @param {String} type - Bulletin type. One of  REPORT_TYPE
   * @param {String} filename - PDF file name in Firebase Storage
   * @returns {Promise} Firestore document and PDF file deletion async Promise
   */
  async deleteBulletin ({ type, filename }) {
    const body = { type, filename }
    const obj = await this.createRequestObject({ body })
    this.AxiosCancelSource = axios.CancelToken.source()

    return await axios({
      ...obj,
      url: _Bulletin.DELETE_BULLETIN,
      method: 'DELETE',
      cancelToken: this.AxiosCancelSource.token
    })
  }

  /**
   * Get Bulletin documents
   * @param {String} bulletinCollection - Firestore collection name containing a specific type of Bulletin documents
   * @returns {Object[]} Bulletin document
   */
  async getBulletins (bulletinCollection) {
    return await this.FirestoreQuery.getCollectionData(bulletinCollection, 'idstr')
  }

  /**
   * Abort an on-going axios request from this class
   * @param {String} message - Custom message when aborting an axios request
   */
  cancelAxiosRequest (message) {
    this.AxiosCancelSource.cancel(message)
  }
}
