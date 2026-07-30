const { admin, db } = require('../../utils/db')
const { FIRESTORE_COLLECTIONS } = require('../../utils/constants')

// Page Search Keywords
class Search {
  async createsearchwords ({ page, path, name, info, content }) {
    try {
      const docRef = await db.collection(FIRESTORE_COLLECTIONS.PAGE_SEARCH)
        .doc(page)
        .set({
          id: page,
          path,
          name,
          info,
          content,
          date_created: admin.firestore.Timestamp.now()
        })
      return { docRef }
    } catch (err) {
      throw new Error(err.message)
    }
  }
}

module.exports = Search
