import { Phonebook } from './phonebook'

const PHONEBOOK = new Phonebook()

export const createContact = PHONEBOOK.createContact.bind(PHONEBOOK)
export const deleteContact = PHONEBOOK.deleteContact.bind(PHONEBOOK)
export const editContact = PHONEBOOK.editContact.bind(PHONEBOOK)
export const getContacts = PHONEBOOK.getContacts.bind(PHONEBOOK)
