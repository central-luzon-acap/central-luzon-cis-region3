const { db } = require('../../../../utils/db')

class DocumentLister {
  #COLLECTION_PATH = ''
  #DOCUMENT_PATH = ''

  constructor ({ collectionPath, documentPath }) {
    this.#COLLECTION_PATH = collectionPath
    this.#DOCUMENT_PATH = documentPath
  }

  /**
   * Fetches all documents in a Firestore collection "#COLLECTION_PATH"
   * @returns {Object[]} Firestore documents
   */
  async getDocuments () {
    const keys = this.#COLLECTION_PATH.split('/')

    const colRef = db.collection(keys[0])
      .doc(keys[1])
      .collection(keys[2])

    const docs = await colRef.get()
      .then((snapshot) =>
        snapshot.docs.map((doc) =>
          doc.data()
        )
      )

    return docs
  }

  /**
   * Creates a "list[]" array field inside the "#DOCUMENT_PATH" Firestore document, and populates it with
   * the document ID list of all documents from the "#COLLECTION_PATH" collection.
   * @param {String[]} docIdList
   * @returns {Promise}
   */
  async createDocumentList (docIdList) {
    const keys = this.#DOCUMENT_PATH.split('/')
    const docRef = db.collection(keys[0]).doc(keys[1])

    return await docRef.set({
      list: docIdList
    })
  }
}

module.exports = DocumentLister
