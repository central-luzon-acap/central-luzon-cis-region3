import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/router'

import withAuthListener from '@/common/entities/withauth'
import ProtectedPage from '@/common/layout/protectedpage'
import ViewCropsBulletin from '@/domain/admin/bulletins/report/view'
import { reportReset } from '@/store/reports/reportSlice'
import { ACCOUNT_LEVEL } from '@/utils/constants'
import { DAY_FORMAT_OPTIONS } from '@/utils/date'

// Services
import { deleteExistingReport } from '@/store/reports/reportThunks'
import { getReport } from '@/services/report'

const defaultState = { loading: true, error: '', info: '', deleting: false }

function ViewCropsBulletinContainer (props) {
  const [report, setReport] = useState(defaultState)
  const router = useRouter()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(reportReset())
  }, [dispatch])

  useEffect(() => {
    if (report.loading && Object.keys(router.query).length > 0) {
      const fetchReport = async () => {
        try {
          const report = await getReport(router.query.docId)
          const dateCreated = report.date_created.toDate()

          report.date_created = `${dateCreated.toDateString()} ${dateCreated
            .toLocaleTimeString('it-IT', DAY_FORMAT_OPTIONS)}`

          setReport(prev => ({ ...prev, loading: false, ...report }))
        } catch (err) {
          setReport({ ...defaultState, loading: false, error: err.message })
        }
      }

      fetchReport()
    }
  }, [router, report.loading])

  const handleDeleteReport = async () => {
    if (report.info === '') {
      dispatch(deleteExistingReport(report.id))
        .unwrap()
        .then(() => {
          setReport(prev => ({ ...prev, deleting: false, info: 'Report deleted.' }))
        })
    } else {
      router.push('/admin/bulletins/crops')
    }
  }

  const onBackBtnClick = () => {
    router.push('/admin/bulletins/crops')
  }

  const onSmsBtnClick = () => {
    router.push({
      pathname: '/admin/sms/viewSMS',
      query: { docId: report.id}
    })
  }

  return (
    <ProtectedPage
      loading={props.loading}
      user={props.user}
      onBtnLogoutClick={props.onBtnLogoutClick}
      accLevel={ACCOUNT_LEVEL.ADMIN}
    >
      <ViewCropsBulletin
        report={report}
        loading={props.loading}
        onBackBtnClick={onBackBtnClick}
        onDeleteClick={handleDeleteReport}
        onSmsBtnClick={onSmsBtnClick}
      />
    </ProtectedPage>
  )
}

export default withAuthListener(ViewCropsBulletinContainer)
