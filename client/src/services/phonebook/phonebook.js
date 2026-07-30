import axios from 'axios'
import RequestObject from '../../utils/requestobject'

export const _Phonebook = {
  BASE_API_URL: process.env.BASE_API_URL,
  CREATE_CONTACT: `${process.env.BASE_API_URL}/contact`,
  DELETE_CONTACT: `${process.env.BASE_API_URL}/contact`,
  EDIT_CONTACT: `${process.env.BASE_API_URL}/contact`,
  GET_CONTACTS: `${process.env.BASE_API_URL}/contacts`,
  PHONEBOOK: 'phonebook',
}

export class Phonebook extends RequestObject {
  async createContact(body) {
    const obj = await this.createRequestObject({ body })
    const res = await axios({
      ...obj,
      url: _Phonebook.CREATE_CONTACT,
      method: 'POST',
    })
    return res.data
  }

  async deleteContact(body) {
    const obj = await this.createRequestObject({ body })
    const res = await axios({
      ...obj,
      url: _Phonebook.DELETE_CONTACT,
      method: 'DELETE',
    })
    return res.data
  }

  async editContact(body) {
    const obj = await this.createRequestObject({ body })
    const res = await axios({
      ...obj,
      url: _Phonebook.EDIT_CONTACT,
      method: 'PATCH',
    })
    return res.data
  }

  async getContacts() {
    const obj = await this.createRequestObject({})
    const res = await axios({
      ...obj,
      url: _Phonebook.GET_CONTACTS,
      method: 'GET',
    })
    return res.data.contacts
  }
}
