const { getuser } = require('../classes/user')

/**
 * Checks if a Firebase Auth user account is disabled. Requires the "req.user" object from calling "validFirebaseToken()" first.
 * This middleware immediately rejects API access even if the account-disabled user's refresh token is still valid (max validity of 1 hour even after disabling account).
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} next - Express next object
 * @returns
 */
const rejectAccountDisabled = async (req, res, next) => {
  if (req.user === undefined) {
    res.status(403).send('Unauthorized')
    return
  }

  try {
    const userAccount = await getuser({ uid: req.user.uid })

    if (userAccount.disabled) {
      res.status(403).send('Unauthorized. Your account is disabled.')
      return
    }

    next()
  } catch (error) {
    console.error('Error while checking User account:', error)
    return res.status(403).send('Unauthorized')
  }
}

module.exports = rejectAccountDisabled
