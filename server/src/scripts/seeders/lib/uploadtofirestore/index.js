const { FirestoreData } = require('csv-firestore')
const firestore = new FirestoreData()
const { db } = require('../../../../utils/db')
const { FieldValue } = require('firebase-admin/firestore')

/**
 * Create or update the contents of a Firestore document under a Firestore collection
 * @param {String} collectionName - Firestore collection name
 * @param {String} docName - Firestore document name
 * @param {Object} jsonData - JSON data to upload in the Firestore docName document
 *    - {Object[]} data - crop recommendations mapped to crop stages, farm operations and other keys
 *    - {String} type - type of recommendations. One of RECOMMEDATIONS_TYPE.
 *    - {String} description - Brief text description describing the nature of data
 * @param {Object} metadata - Key-value pairs description and other information about the data
 * @returns {Timestamp} Firestore timestamp of successful data upload
 */
module.exports.uploadToFirestore = async (collectionName, docName, jsonData, metadata) => {
  // CSV and Firestore handler
  jsonData.metadata = metadata ?? {}
  jsonData.metadata.date_created = firestore.admin.firestore.Timestamp.now()

  try {
    // Upload data to Firestore
    const docRef = await firestore.db
      .collection(collectionName)
      .doc(docName)
      .set(jsonData)

    return docRef
  } catch (err) {
    throw new Error(err.message)
  }
}

module.exports.addCropToCropList = async (collectionName, cropName) => {
  try {
    const docRef = db
      .collection(collectionName)
      .doc('calendar')

    const cropDoc = await docRef.get()

    if (cropDoc.exists) {
      return await docRef.update({
        list: FieldValue.arrayUnion(cropName)
      })
    } else {
      return await docRef.set({ list: [cropName] })
    }
  } catch (err) {
    throw new Error(err.message)
  }
}

const deleteQueryBatch = async (db, query, resolve) => {
  const snapshot = await query.get()
  const batchSize = snapshot.size

  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve()
    return
  }

  const batch = db.batch()
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref)
  })

  await batch.commit()

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve)
  })
}

module.exports.deleteCollection = async (collectionName) => {
  const subCollectionRef = db.collection(collectionName)
  const batchSize = 100
  const query = subCollectionRef.limit(batchSize)

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject)
  })
}
