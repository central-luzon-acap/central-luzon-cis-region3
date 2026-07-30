import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import withAuthListener from '@/common/entities/withauth'
import AdminCropsBulletins from '@/components/admin/bulletins/crops'
import ProtectedPage from '@/common/layout/protectedpage'
import { fetchReports } from '@/store/reports/reportThunks'
import { reportTypeReceived } from '@/store/dashboard/dashboardSlice'
import { ACCOUNT_LEVEL } from '@/utils/constants'
import { ADAPTER_STATES } from '@/store/constants'

function AdminCropsBulletinsContainer(props) {
  const [rows, setRows] = useState([])
  const [columns, setColumns] = useState([])
  const [message, setMessage] = useState('')
  const reportType = useSelector((state) => state.dashboard.reportType)
  const mounted = useRef(false)
  const pageInitialized = useRef(false)
  const dispatch = useDispatch()

  const {
    ids: repIds,
    entities: reports,
    status: reportLoading
  } = useSelector((state) => state.reports)

  useEffect(() => {
    mounted.current = true

    // Prevent state updates if the component was unmounted
    return () => {
      mounted.current = false
    }
  }, [])

  // Fetch a signed-in user's reports only once on 1st page load
  useEffect(() => {
    if (
      props.user !== null &&
      !props.loading &&
      repIds.length === 0 &&
      !pageInitialized.current
    ) {
      pageInitialized.current = true

      dispatch(
        fetchReports({
          uid: props.user.uid,
          type: reportType
        })
      )
    }
  }, [props.user, props.loading, repIds, reportType, dispatch])

  // Set the DataGrid table's rows and columns data
  useEffect(() => {
    if (
      [ADAPTER_STATES.FULLFILLED, ADAPTER_STATES.IDLE].includes(
        reportLoading
      ) &&
      repIds.length > 0
    ) {
      // Set column headers
      const headers = [
        'crop',
        'province',
        'municipality',
        'type',
        'updated_by',
        'date_created'
      ]
      const headersFormat = {
        crop: 'Crop',
        province: 'Province',
        municipality: 'Municipality',
        type: 'Bulletin Type',
        updated_by: 'Updated by',
        date_created: 'Date Created'
      }
      const headerWidth = {
        // crop: 180,
        province: 180,
        municipality: 180,
        type: 110,
        // updated_by: 180,
        date_created: 200
      }

      const colData = []

      headers.forEach((item) => {
        colData.push({
          field: item,
          headerName: headersFormat[item],
          minWidth: headerWidth[item],
          flex: headerWidth[item] === undefined ? 1 : 0,
          editable: false,
          sortable: false,
          disableColumnMenu: true
        })
      })

      // Set the rows data
      const rowdata = repIds.map((item, i) => ({
        id: i,
        docId: reports[item].id,
        crop: reports[item].crop,
        province: reports[item].province,
        municipality: reports[item].municipality,
        type: reports[item].type,
        updated_by: reports[item].updated_by,
        date_created: reports[item].date_created
      }))

      if (mounted.current) {
        setRows(rowdata)
        setColumns(colData)
      }
    }
  }, [reportLoading, repIds, reports])

  const handleChange = (e) => {
    const { value } = e.target

    dispatch(
      fetchReports({
        uid: props.user.uid,
        type: value
      })
    )
      .unwrap()
      .then((result) => {
        if (result.length > 0) {
          dispatch(reportTypeReceived(value))
        }
      })
      .catch(() => {
        setMessage(`No ${value} reports are available.`)
      })
  }

  return (
    <ProtectedPage
      loading={props.loading}
      user={props.user}
      onBtnLogoutClick={props.onBtnLogoutClick}
      accLevel={ACCOUNT_LEVEL.ADMIN}
    >
      <AdminCropsBulletins
        rows={rows}
        columns={columns}
        loadingReports={reportLoading === ADAPTER_STATES.PENDING}
        message={message}
        resetMessage={() => setMessage('')}
        handleTypeChange={handleChange}
      />
    </ProtectedPage>
  )
}

export default withAuthListener(AdminCropsBulletinsContainer)
