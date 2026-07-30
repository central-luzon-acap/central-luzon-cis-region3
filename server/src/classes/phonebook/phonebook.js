const { admin, db } = require('../../utils/db')
const { FIRESTORE_COLLECTIONS } = require('../../utils/constants')

class Phonebook {
  async addContact ({ name, cellnumber, nickname, province, municipality, subscribed_crops, user }) {
    const id = db.collection(FIRESTORE_COLLECTIONS.PHONEBOOK).doc().id

    try {
      const docRef = await db
        .collection(FIRESTORE_COLLECTIONS.PHONEBOOK)
        .doc(id)
        .set({
          id,
          name,
          cellnumber,
          nickname,
          province,
          municipality,
          subscribed_crops,
          updated_by: user.email,
          uid: user.uid,
          type: FIRESTORE_COLLECTIONS.PHONEBOOK,
          date_created: admin.firestore.Timestamp.now()
        })
      return { docRef, id }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async updateContact (docId, name, cellnumber, nickname, province, municipality, subscribed_crops) {
    try {
      await db.collection(FIRESTORE_COLLECTIONS.PHONEBOOK).doc(docId).update({
        name,
        cellnumber,
        nickname,
        province,
        municipality,
        subscribed_crops
      })

      return true
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async getContacts (user) {
    try {
      let phonebookRef = db.collection(FIRESTORE_COLLECTIONS.PHONEBOOK)
      phonebookRef = phonebookRef.where('updated_by', '==', user.email)
      const phonebook = await phonebookRef.get()
        .then((snapshot) =>
          snapshot.docs.map((doc) =>
            doc.data()
          )
        )
      return phonebook
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async deleteContact (contactId) {
    try {
      await db
        .collection(FIRESTORE_COLLECTIONS.PHONEBOOK)
        .doc(contactId)
        .delete()
      return true
    } catch (err) {
      throw new Error(err.message)
    }
  }
}

module.exports = Phonebook
