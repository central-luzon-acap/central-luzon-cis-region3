const {
  sendSmsRecommendations: _sendSmsRecommendations
} = require('../classes/text')
const { updateReportForSmsLogs } = require('../classes/report')
const { getContacts } = require('../classes/phonebook')
const { isValidRecipients } = require('../utils/validators')

const sendSmsRecommendations = async (req, res, next) => {
  const {
    docId,
    message,
    currentSmsLogs,
    recipientsNumber,
    recipientsWithName
  } = req.body
  const user = req.user

  if (
    docId === undefined ||
    message === undefined ||
    currentSmsLogs === undefined ||
    recipientsNumber === undefined ||
    recipientsWithName === undefined
  ) {
    return res.status(400).send('Missing parameter/s.')
  }

  if (message.length <= 0) {
    return res.status(400).send('No message to send.')
  }

  const recipientsSplitByComma = recipientsNumber.split(',')
  const trimmed = recipientsSplitByComma.map((recipient) => recipient.trim())
  const recipientsWithNoDuplicates = [...new Set(trimmed)]

  if (!isValidRecipients(recipientsWithNoDuplicates)) {
    return res.status(400).send('Invalid set of cell numbers.')
  }

  /**
   * This is to check each number/recipient if it's in the Admin's
   * phonebook or not.
   */
  const contacts = await getContacts(user)
  const contactsNumber = contacts.map((contact) => contact.cellnumber)
  const invalidSending = recipientsWithNoDuplicates.filter((recipient) => {
    if (!contactsNumber.includes(recipient)) {
      return true
    } else return false
  })
  if (invalidSending.length) {
    return res
      .status(400)
      .send('Trying to send to a number not in your phonebook.')
  }

  try {
    /**
     * After sending the texts, the response of that is an array of
     * objects containing the sent details:
     * For example:
     * [
     *  {
     *      "message_id": 123,
     *      "user_id": 123,
     *      "user": "admin4@gmail.com",
     *      "account_id": 123,
     *      "account": "CIAT",
     *      "recipient": "639112224444",
     *      "message": "Hello World!",
     *      "sender_name": "CIAT",
     *      "network": "Globe",
     *      "status": "Pending",
     *      "type": "Single",
     *      "source": "Api",
     *      "created_at": "2022-08-08 07:02:07",
     *      "updated_at": "2022-08-08 07:02:07"
     *  }
     * ]
     *
     * This then will used for updating the logs property of the sent report,
     * so the admin can check the status of the texts along the recipients,
     * and even resend the same message if the admin wants too.
     */
    const response = await _sendSmsRecommendations(
      recipientsWithNoDuplicates,
      message
    )

    if (response.data) {
      // Only update the logs property if the sending is successful.
      const logObject = {
        dateSent: Date.now(),
        sentMessage: message,
        logs: response.data,
        recipientsNumber,
        recipientsWithName
      }

      currentSmsLogs.unshift(JSON.stringify(logObject))
      await updateReportForSmsLogs(docId, currentSmsLogs)
      return res.status(200).send('Successfully sent the SMS recommendation.')
    }
  } catch (err) {
    return next(new Error(err))
  }
}

module.exports = {
  sendSmsRecommendations
}
