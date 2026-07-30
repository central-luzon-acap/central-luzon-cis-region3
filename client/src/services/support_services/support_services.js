import FirestoreService from '../../utils/firestoreutils'
import { orderBy } from 'firebase/firestore'

export class SupportServices extends FirestoreService {
  getSupportServices = async () => {
    const rCollection = 'support_services'
    const colRef = this.collection(this.db, rCollection)
    const q = this.query(colRef, orderBy('date', 'asc'))
    const querySnapshot = await this.getDocs(q)
    const data = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      docId: doc.id,
    }))

    return data
  }

  addSupportService = async ({ supportService }) => {
    const rCollection = 'support_services'
    const colRef = this.collection(this.db, rCollection)
    await this.addDoc(colRef, { data: supportService, date: new Date() })
  }

  updateSupportService = async (supportService) => {
    const rCollection = 'support_services'
    const colRef = this.collection(this.db, rCollection)
    const docRef = this.doc(colRef, supportService.docId)

    delete supportService.docId
    await this.updateDoc(docRef, supportService)
  }

  deleteSupportService = async (supportServiceId) => {
    const docRef = this.doc(this.db, 'support_services', supportServiceId)
    await this.deleteDoc(docRef)
  }
}
