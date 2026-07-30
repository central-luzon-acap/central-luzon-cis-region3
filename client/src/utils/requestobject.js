import { auth } from '@/firebase/firebase.config'

export default class RequestObject {
  // Fetch the Firebase auth token
  // Attach the token in the Authorization header of a request object along with the body/query parameters
  // Call this method after the Firebase Auth user data has settled in
  async setAuthHeaders(obj) {
    let token

    try {
      token = await auth.currentUser.getIdToken(true)
    } catch (err) {
      throw new Error(err.message)
    }

    if (token) {
      obj.headers.Authorization = `Bearer ${token}`
    } else {
      obj.headers.Authorization = ''
    }
  }

  /**
   * Attach a Firebase ID token in the Authorization header of a request object
   * @param {Object} param.body - Request parameters in the request body
   * @param {Object} param.params - Request "query" parameters
   */
  async createRequestObject({ body, params, responseType }) {
    const obj = {
      headers: {},
    }

    if (body) {
      obj.data = body
    }

    if (params) {
      obj.params = params
    }

    if (responseType) {
      obj.responseType = responseType
    }

    await this.setAuthHeaders(obj)
    return obj
  }
}
