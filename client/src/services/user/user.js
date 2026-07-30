import axios from 'axios'
import RequestObject from '@/utils/requestobject'

export default class User extends RequestObject {
  constructor () {
    super()

    this.BASE_URL = process.env.BASE_API_URL
    this.USERS_API = `${this.BASE_URL}/user`
    this.USERS_API_LIST = `${this.BASE_URL}/users`
  }

  async createUser (user) {
    const body = {}
    const fields = [
      'email', 'displayname', 'password',
      'account_level', 'disabled', 'emailverified'
    ]

    fields.forEach((item) => {
      if (user[item] !== undefined && user[item] !== '') {
        body[item] = user[item]
      } else {
        throw new Error('Please check your input.')
      }
    })

    const obj = await this.createRequestObject({ body })
    const res = await axios({ ...obj, url: this.USERS_API, method: 'POST' })
    return res.data
  }

  async updateUser (info) {
    const body = {}
    const fields = [
      'uid', 'email', 'displayname', 'password',
      'disabled', 'emailverified', 'account_level'
    ]

    fields.forEach((item) => {
      if (info[item.toLowerCase()] !== undefined
        && (item !== 'password')
          ? info[item] !== ''
          : true)
      {
        body[item] = info[item]
      } else {
        throw new Error('Please check your input.')
      }
    })

    const obj = await this.createRequestObject({ body })
    const res = await axios({ ...obj, url: this.USERS_API, method: 'PATCH' })
    return res.data
  }

  async deleteUser (uid) {
    const obj = await this.createRequestObject({})
    const res = await axios.delete(`${this.USERS_API}/${uid}`, obj)
    return res.data
  }

  async getUser ({ uid, email }) {
    let params = {}

    if (uid) {
      params = { uid }
    }

    if (email) {
      params = { email }
    }

    const obj = await this.createRequestObject({ params })
    const res = await axios.get(`${this.BASE_URL}/user`, obj)
    return res.data
  }

  getUsers = async () => await axios.get(this.USERS_API_LIST)
}
