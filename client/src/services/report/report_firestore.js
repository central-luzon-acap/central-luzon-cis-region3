import FirestoreService from '@/utils/firestoreutils'

export const _ReportFirestore = {
  REPORTS_CROPS: 'reports_crops'
}

export class ReportFirestore extends FirestoreService {
  getReport = async (docId) =>
    await this.getDocumentData(_ReportFirestore.REPORTS_CROPS, docId)

  getReports = async (uid, type) => {
    const colRef = this.collection(this.db, _ReportFirestore.REPORTS_CROPS)
    const conditions = [this.where('uid', '==', uid)]

    if (type) {
      conditions.push(this.where('type', '==', type))
    }

    let q = this.query(colRef, ...conditions)
    return await this.getCollectionData(_ReportFirestore.REPORTS_CROPS, '', q)
  }
}
