const { FieldValue } = require('firebase-admin/firestore')
const { db } = require('../../../../utils/db')

/**
 * An async Firestore array field handler.
 */
class FirestorePairsArray {
  #LIST_PATH = ''
  #DOCS_PATH = ''
  #DOC = ''
  #LIST = []
  #MAX = -1
  #IS_FULL = false
  #LOG_PREFIX = '[FIRESTORE-ARRAY]:'

  constructor ({ listPath, maxItems }) {
    const keysList = listPath.split('/')

    this.#LIST_PATH = keysList[0]
    this.#DOC = keysList[1]

    this.#DOCS_PATH = keysList[0]
    this.#MAX = maxItems
  }

  /**
   * Initialize the Firestore list and local caches
   */
  async init () {
    try {
      const ref = await this.listReference().get()

      if (!ref.exists) {
        this.logMessage('Creating a list document')

        await this.listReference().set({ list: [] })
      } else {
        const temp = ref.data()

        if (temp.list === undefined) {
          await this.listReference().update({ list: [] })
        } else {
          this.#LIST = [...temp.list]
          this.#IS_FULL = (this.#LIST.length >= this.#MAX)

          this.logMessage(`Loaded ${this.#LIST.length} list items`)
        }
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  /**
   * Get a Firestore document reference of the lightweight "list":
   * {root_collection}/{document}
   * @returns {Object} Firestore doc reference
   */
  listReference () {
    return db.collection(this.#LIST_PATH).doc(this.#DOC)
  }

  /**
   * Get a Firestore document reference of a full document in:
   * {root_collection}/{document}/{collection}/{document}
   * @param {String} collectionName - nested Firestore collection name (2nd level only)
   * @param {*} documentName - nested Firestore document name
   * @returns
   */
  docReference (collectionName, documentName) {
    return db
      .collection(this.#DOCS_PATH)
      .doc(this.#DOC)
      .collection(collectionName)
      .doc(documentName)
  }

  /**
   * Append a prefix to console.log messages
   * @param {String} message - log message
   */
  logMessage (message) {
    console.log(`${this.#LOG_PREFIX} ${message}`)
  }

  /**
   * Retrieves the "list[]" (an array field) from a Firestore document
   * @returns {String[]} String array list from Firestore
   */
  async getList () {
    return (await this.listReference().get()).data().list
  }

  /**
   * Replace the "list[]" with new values.
   * @param {String[]} newList - Array of document IDs
   * @returns
   */
  async setList (newList) {
    return await this.listReference().set({ list: newList })
  }

  /**
   * Adds an item to the "list[]" (an array field) of a Firestore document
   * @param {String} item - Item to insert
   * @returns {String[]} String array list from Firestore
   */
  async pushItem (item) {
    this.logMessage(`Inserting ID ${item} to ${this.#LIST_PATH}/${this.#DOC} list`)

    return await this.listReference().update({
      list: FieldValue.arrayUnion(item)
    })
  }

  /**
   * Deletes an item from the "list[]" (an array field) of a Firestore document
   * @param {String} item - Item to delete
   * @returns {String[]} String array list from Firestore
   */
  async deleteItem (item) {
    this.logMessage(`Deleting ID ${item} from list`)

    return await this.listReference().update({
      list: FieldValue.arrayRemove(item)
    })
  }

  get itemlist () {
    return this.#LIST
  }
}

module.exports = FirestorePairsArray
