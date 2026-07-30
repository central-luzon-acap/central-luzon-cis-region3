import { db } from '@/firebase/firebase.config'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'

export default class FirestoreService {
  constructor() {
    this.db = db
    this.collection = collection
    this.doc = doc
    this.getDocs = getDocs
    this.getDoc = getDoc
    this.query = query
    this.where = where
    this.limit = limit
    this.orderBy = orderBy
    this.updateDoc = updateDoc
    this.addDoc = addDoc
    this.deleteDoc = deleteDoc
  }

  /**
   * Get all firestore collection documents
   * @param {String} collectionName - firestore collection name
   * @param {String} fieldName - firestore document fieldname to use for ordering data
   * @param {Firestore Query} queryDef - firestore query definition
   */
  async getCollectionData(collectionName, fieldName, queryDef = null) {
    const colRef = collection(db, collectionName)
    const q = queryDef ? queryDef : query(colRef, orderBy(fieldName, 'asc'))

    const snapshot = await getDocs(q)
    const data = snapshot.docs.map((doc) => ({ ...doc.data() }))

    return data
  }

  /**
   * Get all firestore collection documents
   * @param {String} collectionName - firestore collection name
   * @param {String} fieldName - firestore document fieldname to use for ordering data
   * @param {Firestore Query} queryDef - firestore query definition
   */
  async getCollectionDataWithID(collectionName, fieldName, queryDef = null) {
    const colRef = collection(db, collectionName)
    const q = queryDef ? queryDef : query(colRef, orderBy(fieldName, 'asc'))

    const snapshot = await getDocs(q)
    const data = snapshot.docs.map((doc) => ({ docid: doc.id, ...doc.data() }))

    return data
  }

  // Get documents from a "subcollection" - collection under a document
  async getNestedCollectionData(
    mainCollection,
    docName,
    subCollection,
    fieldName = '',
  ) {
    const colRef = query(
      collection(db, mainCollection, docName, subCollection),
      orderBy(fieldName),
    )

    const snapshot = await getDocs(colRef)

    const data = snapshot.docs.map((doc) => ({ ...doc.data() }))

    return data
  }

  /**
   * Get a single document inside a main or sub (nested) collection
   * @param {String} documentPath - A slash-separated path to a document
   * @param {String} docName - Additional path segments that will be applied relative to the first argument
   * @returns {Object} Firestore DocumentReference instance
   */
  async getDocumentData(documentPath, docName) {
    const docRef = this.doc(this.db, documentPath, docName)
    const docSnap = await this.getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      return undefined
    }
  }

  /**
   * Get a single document inside a main or sub (nested) collection
   * @param {String} documentPath - A slash-separated path to a document
   * @param {String} docName - Additional path segments that will be applied relative to the first argument
   * @returns {Object} Firestore DocumentReference instance
   */
  async getDocumentDataV2(documentPath, docName) {
    const docRef = this.doc(this.db, documentPath, docName)
    const docSnap = await this.getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      return undefined
    }
  }
}
