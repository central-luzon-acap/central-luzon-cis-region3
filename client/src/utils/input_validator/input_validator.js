export default class InputValidator {
  isValidEmail (email = '') {
    return /^[a-z.A-Z.0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/.test(email) && email !== ''
  }

  isValidName (name = '') {
    return /[a-zA-Z0-9. ]+$/.test(name.trim()) && name !== ''
  }

  isValidPassword (password = '') {
    return password.length > 0
  }
}
