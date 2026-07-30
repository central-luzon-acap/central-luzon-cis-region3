const { db } = require('../../../../utils/db')
const FirestorePairsArray = require('./firestorearray')

/**
 * Deletes Firestore documents using a list of document IDs mapping inside a Firestore array.
 * This makes it easier to delete documents without loading everything at once.
 */
class ArchivesCleaner extends FirestorePairsArray {
  constructor ({ listPath, docsPath, maxItems }) {
    super({ listPath, docsPath, maxItems })
  }

  /**
   * Deletes an item from the lightweight "list[]" array and its similarly-named document from a subcollection
   * @param {String} collectionName - Nested subcollection name under a main collection
   * @param {String} item - Item to delete
   * @returns
   */
  async deleteItemPair (collectionName, item) {
    const docRef = this.docReference(collectionName, item)

    return await Promise.all([
      this.deleteItem(item),
      docRef.delete()
    ])
  }

  /**
   * Use Firestore batch write transaction to delete multitple documents.
   * The documents should be placed under a {root_collection}/{document}/{collection}/{document}
   * The "list[]" should be a key field inside {root_collection}/{document}
   * @param {Stromh} collectionName - Collection name
   * @param {*} deleteList - List of document IDs to delete
   */
  async batchDeleteItemPair (collectionName, deleteList) {
    if (deleteList.length === 0) {
      this.logMessage(`Nothing to delete for ${collectionName}`)
      return
    }

    try {
      const batch = db.batch()

      // Delete documents
      deleteList.forEach((item) => {
        const docRef = this.docReference(collectionName, item)
        batch.delete(docRef)
      })

      // Delete items in the array
      // Filter only items not included in the deleteList
      const retainList = this.itemlist.filter(item => !deleteList.includes(item))

      this.logMessage(`Deleting (${deleteList.length}) documents...`)

      return await Promise.all([
        batch.commit(),
        this.setList(retainList)
      ])
    } catch (err) {
      throw new Error(err.message)
    }
  }
}

module.exports = ArchivesCleaner
