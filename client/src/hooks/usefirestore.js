import { useEffect, useState, useRef } from 'react'
import { doc, getDoc, getDocs, collection, query, orderBy, limit } from 'firebase/firestore'
import { db } from '@/firebase/firebase.config'

/**
 * Fetch a single Document
 * @param {String} collectionName - Firestore Collection name
 * @param {String} documentName - Firestore Document name or path segments leading to a Document
 * @returns {Object} {document: Document, loading: Bool, error: String}
 */
export function useDocument (collectionName, documentName) {
  const [document, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const mounted = useRef(true)

  useEffect(() => {
    const load = async () => {
      try {
        const docRef = doc(db, collectionName, documentName)
        const docSnap = await getDoc(docRef)

        if (mounted.current) {
          if (docSnap.exists()) {
            setDoc(docSnap.data())
          }

          setLoading(false)
        }
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    load()
    return () => mounted.current = false
  }, [collectionName, documentName])

  return [document, loading, error]
}

/**
 * Fetch Documents inside a Collection.
 * The target Collection is at the top-level (root) hierarchy.
 * @param {String} collectionName - Firestore Collection name or a slash-separated path to nested sub-collections
 * @param {String} fieldName - Field name inside a Document to match the ASC or DESC ordering
 * @param {Query} queryDef - Firestore query definition
 * @returns {Object} {documents[]: Documents, loading: Bool, error: String}
 */
export function useCollection (collectionName, fieldName, queryDef = null, limitBy = 0) {
  const [documents, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const mounted = useRef(true)

  useEffect(() => {
    const load = async () => {
      try {
        const constraints = [orderBy(fieldName, 'asc')]

        if (limitBy > 0) {
          constraints.push(limit(limitBy))
        }

        const colRef = collection(db, collectionName)
        const q = (queryDef)
          ? queryDef
          : query(colRef, ...constraints)

        const snapshot = await getDocs(q)

        if (mounted.current) {
          setDocs(snapshot.docs
            .map((doc) => ({ ...doc.data() })))
          setLoading(false)
        }
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    load()
    return () => mounted.current = false
  }, [collectionName, fieldName, queryDef, limitBy])

  return { documents, loading, error }
}

/**
 * Fetch Documents inside a Collection.
 * The target Collection is a sub-Collection: it is inside a Document.
 * @param {String} collectionName - Firestore (root) Collection name
 * @param {String} docName - Target Document name inside collectionName
 * @param {String} subCollection - Firestore (sub) Collection inside docName.
 * @param {String} fieldName - Field name inside a subCollection's Document to match the ASC or DESC ordering
 * @returns {Object} {documents[]: Documents, loading: Bool, error: String}
 */
export function useNestedCollection (mainCollection, docName, subCollection, fieldName = '') {
  const [documents, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const mounted = useRef(true)

  useEffect(() => {
    const load = async () => {
      try {
        const colRef = query(collection(db, mainCollection, docName, subCollection), orderBy(fieldName))
        const snapshot = await getDocs(colRef)

        if (mounted.current) {
          setDocs(snapshot.docs
            .map((doc) => ({ ...doc.data() })))
          setLoading(false)
        }
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    load()
    return () => mounted.current = false
  }, [mainCollection, docName, subCollection, fieldName])

  return { documents, loading, error }
}

/**
 * Fetch Documents inside a Collection inside a Document with queries:
 *    - orderBy: orders the fetched documents using fieldName
 *    - maxDocs: limit document results response
 * The target Collection is a sub-Collection: it is inside a Document.
 * @param {String} collectionName - Firestore (root) Collection name
 * @param {String} docName - Target Document name inside collectionName
 * @param {String} subCollection - Firestore (sub) Collection inside docName.
 * @param {String} fieldName - Field name inside a subCollection's Document to match the ASC or DESC ordering
 * @param {Number} maxDocs - number of Firestore documents to return as response
 * @returns {Object} {documents[]: Documents, loading: Bool, error: String}
 */
export function useNestedCollectionWithQuery (mainCollection, docName, subCollection, fieldName = '', maxDocs) {
  const [documents, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const mounted = useRef(true)

  useEffect(() => {
    const load = async () => {
      try {
        let colRef = collection(db, mainCollection, docName, subCollection)

        // Order-by query
        if (fieldName !== '') {
          colRef = query(colRef, orderBy(fieldName))
        }

        // Limit query
        if (maxDocs) {
          colRef = query(colRef, limit(maxDocs))
        }

        const snapshot = await getDocs(colRef)

        if (mounted.current) {
          setDocs(snapshot.docs
            .map((doc) => ({ ...doc.data() })))
          setLoading(false)
        }
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    load()
    return () => mounted.current = false
  }, [mainCollection, docName, subCollection, fieldName, maxDocs])

  return { documents, loading, error }
}