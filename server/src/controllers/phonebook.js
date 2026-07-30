const {
  addContact,
  getContacts,
  deleteContact: _deleteContact,
  updateContact: _updateContact
} = require('../classes/phonebook')

const {
  alreadyInTheContactList,
  isInvalidCellnumber,
  isInvalidProvinceAndMunicipality
} = require('../utils/validators')

const { getcropcalcropslistV2 } = require('../classes/calendar_v2')

const createContact = async (req, res, next) => {
  const { name, cellnumber, nickname, province, municipality, subscribed_crops } = req.body
  const user = req.user

  if (
    name === undefined ||
    cellnumber === undefined ||
    nickname === undefined ||
    province === undefined ||
    municipality === undefined ||
    subscribed_crops === undefined
  ) {
    return res.status(500).send('Missing parameter/s.')
  }

  const MAXIMUM_NICKNAME_LENGTH = 5
  if (
    (!(nickname.length > 0 && nickname.length <= MAXIMUM_NICKNAME_LENGTH))
  ) {
    return res.status(400).send(`
      Nickname should only be maximum of 5 characters. Provided with a ${nickname.length} character nickname.
    `)
  }

  if (isInvalidCellnumber(cellnumber)) {
    return res
      .status(400)
      .send('Invalid cell number. Valid format is 09XXYYYZZZZ')
  }

  const { error, result } = await isInvalidProvinceAndMunicipality(province, municipality)

  if (result) {
    return res
      .status(400)
      .send(error)
  }

  const contacts = await getContacts(user)
  if (alreadyInTheContactList(contacts, cellnumber)) {
    return res
      .status(400)
      .send('Invalid cell number. Already exists in your phonebook.')
  }

  const cropList = await getcropcalcropslistV2()
  for (const crop of subscribed_crops) {
    if (!cropList.includes(crop)) {
      return res.status(400).send(`Crop is not in the uploaded crop list: ${crop}`)
    }
  }

  try {
    const response = await addContact({
      user,
      name,
      nickname,
      cellnumber,
      province,
      municipality,
      subscribed_crops
    })
    return res.status(200).send({
      message: 'New Contact added to Phonebook.',
      id: response.id
    })
  } catch (err) {
    return next(new Error(err))
  }
}

const updateContact = async (req, res, next) => {
  const { docId, name, cellnumber, nickname, province, municipality, subscribed_crops } = req.body
  const user = req.user

  if (
    docId === undefined ||
    name === undefined ||
    cellnumber === undefined ||
    nickname === undefined ||
    province === undefined ||
    municipality === undefined ||
    subscribed_crops === undefined
  ) {
    return res.status(400).send('Missing parameters.')
  }

  const MAXIMUM_NICKNAME_LENGTH = 5
  if (
    (!(nickname.length > 0 && nickname.length <= MAXIMUM_NICKNAME_LENGTH))
  ) {
    return res.status(400).send(`
      Nickname should only be maximum of 5 characters. Provided with a ${nickname.length} character nickname.
    `)
  }

  if (isInvalidCellnumber(cellnumber)) {
    return res
      .status(400)
      .send('Invalid cell number. Valid format is 09XXYYYZZZZ')
  }

  const { error, result } = await isInvalidProvinceAndMunicipality(province, municipality)

  if (result) {
    return res
      .status(400)
      .send(error)
  }

  const contacts = await getContacts(user)
  // TODO: how to update this validation for updating contact when you dont change anything to cellnumber
  // edit ->
  // "new" number = old number -> no validation
  // edit ->
  // "new" number = actual new number -> validation
  if (alreadyInTheContactList(contacts, cellnumber, docId)) {
    return res
      .status(400)
      .send('Invalid cell number. Already exists in your phonebook.')
  }

  const cropList = await getcropcalcropslistV2()
  for (const crop of subscribed_crops) {
    if (!cropList.includes(crop)) {
      return res.status(400).send(`Crop is not in the uploaded crop list: ${crop}`)
    }
  }

  try {
    await _updateContact(docId, name, cellnumber, nickname, province, municipality, subscribed_crops)
    return res.status(200).send('Successfully updated contact.')
  } catch (err) {
    next(new Error(err))
  }
}

const viewPhonebook = async (req, res, next) => {
  const user = req.user
  try {
    const contacts = await getContacts(user)
    res.status(200).send({
      contacts
    })
  } catch (err) {
    return next(new Error(err))
  }
}

const deleteContact = async (req, res, next) => {
  const { docId } = req.body

  if (!docId) {
    return res.status(400).send('Missing document ID.')
  }

  try {
    await _deleteContact(docId)
    return res.status(200).send(`Successfully deleted: ${docId}`)
  } catch (err) {
    next(new Error(err))
  }
}

module.exports = {
  createContact,
  deleteContact,
  updateContact,
  viewPhonebook
}
