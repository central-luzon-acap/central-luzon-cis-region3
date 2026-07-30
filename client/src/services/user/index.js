import User from './user'

const USER_SERVICE = new User()

export const createUser = USER_SERVICE.createUser.bind(USER_SERVICE)
export const updateUser = USER_SERVICE.updateUser.bind(USER_SERVICE)
export const deleteUser = USER_SERVICE.deleteUser.bind(USER_SERVICE)
export const getUser = USER_SERVICE.getUser.bind(USER_SERVICE)
export const getUsers = USER_SERVICE.getUsers.bind(USER_SERVICE)
