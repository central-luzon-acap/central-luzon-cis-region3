import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import withAuthListener from '@/common/entities/withauth'
import { getReport } from '@/services/report'
import { getContacts } from '@/services/phonebook'
import ProtectedPage from '@/common/layout/protectedpage'
import { ACCOUNT_LEVEL } from '@/utils/constants'
import { DAY_FORMAT_OPTIONS } from '@/utils/date'
import ViewSendSMS from '@/components/admin/sms/view'

const defaultState = { loading: true, error: '', info: '', sending: false }
function ViewSendSMSContainer(props) {
  const [report, setReport] = useState(defaultState)
  const [contactsState, setContactsState] = useState(defaultState)
  const [contacts, setContacts] = useState([])
  const router = useRouter()

  useEffect(() => {
    if (report.loading && Object.keys(router.query).length > 0 && props.user !== null) {
      const fetchReport = async () => {
        try {
          const report = await getReport(router.query.docId)
          const dateCreated = report.date_created.toDate()
          report.date_created = `${dateCreated.toDateString()} ${dateCreated.toLocaleTimeString('it-IT', DAY_FORMAT_OPTIONS)}`
          setReport((prev) => ({ ...prev, loading: false, ...report }))
        } catch (err) {
          setReport({ ...defaultState, loading: false, error: err.message })
        }
      }

      const _getContacts = async () => {
        try {
          setContactsState({ ...defaultState, loading: true })
          const contacts = await getContacts()
          /* eslint-disable no-unused-vars */
          setContacts(prev => contacts)
          setContactsState(prev => ({ ...prev, loading: false }))
        } catch (err) {
          /* eslint-disable no-unused-vars */
          setReport(prev => ({ ...defaultState, loading: false, error: err.message }))
          setContactsState(prev => ({ ...defaultState, loading: false, error: err.message }))
        }
      }

      fetchReport()
      _getContacts()
    }
  }, [router, report.loading, props.user])

  const onBackBtnClick = () => {
    router.push('/admin/sms/')
  }

  return (
    <ProtectedPage
      loading={props.loading}
      user={props.user}
      onBtnLogoutClick={props.onBtnLogoutClick}
      accLevel={ACCOUNT_LEVEL.ADMIN}
    >
      <ViewSendSMS
        setReport={setReport}
        report={report}
        loading={props.loading}
        contacts={contacts}
        contactsState={contactsState}
        onBackBtnClick={onBackBtnClick}
      />
    </ProtectedPage>
  )
}

export default withAuthListener(ViewSendSMSContainer)
