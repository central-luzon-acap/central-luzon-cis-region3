const SIMPLE_CELLNUMBER_PATTERN = /^09[0-9]{9}$/g
const ERROR_MISSING_CELLNUMBER = 'Cell number is required.'
const ERROR_INVALID_FORMAT_CELLNUMBER = 'Invalid cell number format.'
const ERROR_CONTACT_ALREADY_EXIST =
  'Cell number already exists in the conact list.'
const NO_ERROR = ''

function isInvalidCellnumber(cellnumber) {
  return !cellnumber.match(SIMPLE_CELLNUMBER_PATTERN)
}

function alreadyInTheContactList(contacts, cellnumber) {
  const existingContact = contacts.find(
    (contact) => contact.cellnumber === cellnumber
  )
  return Boolean(existingContact)
}

export const getError = (action, contacts, cellnumber, originalCellnumber) => {
  if (cellnumber === null) return

  /**
   * The reason why there's an action flag here is that in Adding a new contact
   * there's no original cellnumber. It's always the current cellnumber from
   * the input field. Unlike the Editing a contact in which there's a
   * need for comparing the original cellnumbwer from View Contact,
   * with the newly typed cellnumber.
   *
   * The alreadyInTheContactList validation only applies when the user
   * tries to input a NEW cellnumber that's not the previous
   * cellnumber. That's why there's a comparison in check.
   */

  if (cellnumber === '') return 'ERROR_MISSING_CELLNUMBER'
  else if (isInvalidCellnumber(cellnumber))
    return 'ERROR_INVALID_FORMAT_CELLNUMBER'
  else if (action === 'EDIT') {
    if (originalCellnumber && cellnumber !== originalCellnumber) {
      if (alreadyInTheContactList(contacts, cellnumber)) {
        return 'ERROR_CONTACT_ALREADY_EXIST'
      } else {
        return ''
      }
    }
  } else if (action === 'ADD') {
    if (alreadyInTheContactList(contacts, cellnumber)) {
      return 'ERROR_CONTACT_ALREADY_EXIST'
    }
  } else return ''
}

export const getHelperText = (errorLabel) => {
  switch (errorLabel) {
    case 'ERROR_MISSING_CELLNUMBER':
      return ERROR_MISSING_CELLNUMBER
    case 'ERROR_INVALID_FORMAT_CELLNUMBER':
      return ERROR_INVALID_FORMAT_CELLNUMBER
    case 'ERROR_MISSING_CELLNUMBER':
      return ERROR_MISSING_CELLNUMBER
    case 'ERROR_CONTACT_ALREADY_EXIST':
      return ERROR_CONTACT_ALREADY_EXIST
    default:
      return NO_ERROR
  }
}
