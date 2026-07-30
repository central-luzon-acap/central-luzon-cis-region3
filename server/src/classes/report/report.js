const { admin, db } = require('../../utils/db')
const { FIRESTORE_COLLECTIONS, REPORT_TYPE } = require('../../utils/constants')

// Reports
class Report {
  async createreport (params) {
    const {
      region,
      province,
      // municipality,
      crop,
      month,
      date_range = '-',
      stages,
      activities,
      // Seasonal weather condition for only one (1) month
      condition = '-',
      // Seasonal weather condition for only six (6) months
      conditions,
      rainfall = '-',
      risk,
      typhoon,
      wind_signal,
      type = FIRESTORE_COLLECTIONS.SEASONAL
    } = params

    const {
      recommendations = '',
      smsRecommendations = '',
      user
    } = params

    const id = db.collection(FIRESTORE_COLLECTIONS.REPORTS_CROPS).doc().id
    const report = {
      id,
      uid: user.uid,
      region,
      province,
      // municipality,
      crop,
      stages,
      activities,
      month,
      condition,
      ...(conditions && { conditions }),
      type,
      recommendations,
      smsRecommendations,
      updated_by: user.email,
      date_created: admin.firestore.Timestamp.now()
    }

    if ([REPORT_TYPE.TEN_DAY, REPORT_TYPE.SPECIAL].includes(type)) {
      report.date_range = date_range
      report.rainfall = rainfall
    }

    if ([REPORT_TYPE.TEN_DAY, REPORT_TYPE.SEASONAL].includes(type) && risk) {
      report.risk = risk
    }

    if ([REPORT_TYPE.TEN_DAY, REPORT_TYPE.SPECIAL].includes(type) && typhoon && wind_signal) {
      report.typhoon = typhoon
      report.wind_signal = wind_signal
    }

    try {
      const docRef = await db.collection(FIRESTORE_COLLECTIONS.REPORTS_CROPS)
        .doc(id)
        .set(report)
      return { docRef, id }
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async updateReportForSmsLogs (docId, logs) {
    try {
      return await db.collection(FIRESTORE_COLLECTIONS.REPORTS_CROPS).doc(docId).update({
        logs
      })
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async deletereport (docId) {
    try {
      await db.collection(FIRESTORE_COLLECTIONS.REPORTS_CROPS)
        .doc(docId)
        .delete()
      return true
    } catch (err) {
      throw new Error(err.message)
    }
  }

  async getreport (id) {
    return await db.collection(FIRESTORE_COLLECTIONS.REPORTS_CROPS)
      .doc(id)
      .get()
  }
}

module.exports = Report
