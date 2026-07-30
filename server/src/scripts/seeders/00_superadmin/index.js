const { createuser } = require('../../../classes/user')

/**
 * Create initial superadmin and admin accounts.
 *
 * Superadmin:
 *   email: superadmin@gmail.com
 *   password: passwordsecure
 *
 * Admin:
 *   email: admin@gmail.com
 *   password: passwordsecure
 */
const accounts = [
  {
    email: 'superadmin@gmail.com',
    displayname: 'Super Admin',
    account_level: 1,
    password: 'passwordsecure'
  },
  {
    email: 'admin@gmail.com',
    displayname: 'Regular Admin',
    account_level: 2,
    password: 'passwordsecure'
  }
]

const seed = async () => {
  for (const params of accounts) {
    try {
      console.log(`Creating a ${params.email} user (account_level: ${params.account_level})...`)
      const user = await createuser(params)

      console.log('User created!')
      console.log(user)
    } catch (err) {
      console.log(`[${params.email}] ${err.message}`)
    }
  }
}

(async () => {
  await seed()
})()