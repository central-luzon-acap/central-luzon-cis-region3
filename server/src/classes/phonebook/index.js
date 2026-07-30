const Phonebook = require('./phonebook')
const p = new Phonebook()

const addContact = p.addContact.bind(p)
const getContacts = p.getContacts.bind(p)
const deleteContact = p.deleteContact.bind(p)
const updateContact = p.updateContact.bind(p)

module.exports = {
  addContact,
  deleteContact,
  getContacts,
  updateContact
}
