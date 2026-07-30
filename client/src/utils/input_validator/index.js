import InputValidator from './input_validator'

const IV = new InputValidator()

export const isValidEmail = IV.isValidEmail.bind(IV)
export const isValidName = IV.isValidName.bind(IV)
export const isValidPassword = IV.isValidPassword.bind(IV)
