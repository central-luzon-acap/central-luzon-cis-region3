import withAuthListener from '@/common/entities/withauth'
import AdminSMS from '@/components/admin/sms'
import ProtectedPage from '@/common/layout/protectedpage'
import SimpleSnackbar from '@/common/ui/snackbar'
import { reportTypeReceived } from '@/store/dashboard/dashboardSlice'
import { ACCOUNT_LEVEL } from '@/utils/constants'
import { DAY_FORMAT_OPTIONS } from '@/utils/date'
import { useState, useEffect } from 'react'
import { useAuth } from '@/services/auth'
import { useDispatch, useSelector } from 'react-redux'

import { getRegion } from '@/services/region'

import {
  createContact,
  deleteContact,
  editContact,
  getContacts,
} from '@/services/phonebook'
import { useRouter } from 'next/router'
import { getReports } from '@/services/report'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material/'

function AdminSMSContainer({ loading, user, onBtnLogoutClick }) {
  const auth = useAuth()
  const router = useRouter()
  const dispatch = useDispatch()
  const [rows, setRows] = useState([])
  const [columns, setColumns] = useState([])
  const [reports, setReports] = useState([])
  const [contacts, setContacts] = useState([])
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [open, setOpen] = useState(false)
  const [snackbarDetails, setSnackbarDetails] = useState({})
  const [contactsLoading, setContactsLoading] = useState(false)
  const [openViewLogs, setOpenViewLogs] = useState(false)
  const [report, setReport] = useState([])
  const [loadingButton, setLoadingButton] = useState(false)
  const reportType = useSelector((state) => state.dashboard.reportType)
  const [regions, setRegions] = useState([])
  const [province, setProvince] = useState('')
  const [municipality, setMunicipality] = useState('')

  const _getContacts = async () => {
    try {
      setContactsLoading(true)
      const contacts = await getContacts()
      setContacts(contacts)
      setContactsLoading(false)
    } catch (err) {
      console.error(err.message)
    }
  }

  const LogsTable = ({ logs }) => {
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} arial-label="simple-table">
          <TableHead>
            <TableRow>
              <TableCell>Number</TableCell>
              <TableCell>
                Date&nbsp;<span style={{ fontSize: '10px' }}>(MM/DD/YYYY)</span>
              </TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Recipients</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log, index) => {
              const parsedLog = JSON.parse(log)

              const date = new Date(parsedLog.dateSent).toLocaleString()

              return (
                <TableRow
                  key={parsedLog.dateSent}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {index + 1}
                  </TableCell>
                  <TableCell>{date}</TableCell>
                  <TableCell>{parsedLog.sentMessage}</TableCell>
                  <TableCell>{parsedLog.recipientsWithName || parsedLog.recipientsNumber}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  const ViewLogs = ({ report }) => {
    return (
      <Dialog
        fullWidth
        maxWidth="md"
        open={openViewLogs}
        onClose={handleCloseViewLogs}
      >
        <DialogTitle>SMS Recommendation Logs</DialogTitle>

        <DialogContent dividers>
          <Typography variant="body2">
            This is where you can check where you send your texts message.
          </Typography>
          <br />
          <LogsTable logs={report?.logs} />
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleCloseViewLogs}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  useEffect(() => {
    if (auth.user !== null && !auth.loading) {
      const loadTextFormReports = async () => {
        try {
          let bulletins = await getReports(auth.user.uid)
          setReports(bulletins)

          // setLoading(false)
        } catch (err) {
          // setLoading(false)
          console.error(err.message)
        }
      }

      loadTextFormReports()

      _getContacts()
    }
  }, [auth])

  useEffect(() => {
    if (reports.length > 0) {
      const filteredReports = reports.filter(
        (report) => report.type === reportType
      )
      fetchSMS(filteredReports)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports])

  useEffect(() => {
    const _getRegions = async () => {
      try {
        const data = await getRegion()
        setRegions(data?.data ?? [])
      } catch (err) {
        console.error(err.message)
      }
    }

    _getRegions()
  }, [])

  const fetchSMS = (_reports) => {
    /**
     * This is for setting up the rows and columns that will be passed
     * to the DataGrid.
     */

    const headers = [
      'action',
      'logs',
      'crop',
      'text_recommendation',
      'region',
      'province',
      'municipality',
      'month',
      'type',
      'updated_by',
      'date_created',
    ]
    const headersFormat = {
      action: 'Action',
      logs: 'Logs',
      crop: 'Crop',
      text_recommendation: 'Text-Form Recommendation',
      region: 'Region',
      province: 'Province',
      municipality: 'Municipality',
      month: 'Month',
      type: 'Type',
      updated_by: 'Updated by',
      date_created: 'Date Created',
    }

    const colData = []
    headers.forEach((item) => {
      if (item === 'action') {
        colData.push({
          field: item,
          headerName: headersFormat[item],
          width: 100,
          editable: false,
          sortable: false,
          disableColumnMenu: true,
          renderCell: (params) => {
            /**
             * TODO: This function would open up the modal/redirect to a page
             * for texting with Phonebook contacts.
             */
            const onClick = (e) => {
              e.stopPropagation() // don't select this row after clicking

              router.push({
                pathname: '/admin/sms/viewSMS/',
                query: { docId: params.row.docId },
              })
            }

            return (
              <Button variant="outlined" size="small" onClick={onClick}>
                SEND
              </Button>
            )
          },
        })
      } else if (item === 'logs') {
        colData.push({
          field: item,
          headerName: headersFormat[item],
          width: 100,
          editable: false,
          sortable: false,
          disableColumnMenu: true,
          renderCell: (params) => {
            /**
             * TODO: This function would open up the modal/redirect to a page
             * for texting with Phonebook contacts.
             */
            const handleOpenViewLogs = () => {
              setOpenViewLogs(true)
              setReport(params.row)
            }

            return params.row.logs?.length > 0 ? (
              <Button
                variant="outlined"
                size="small"
                onClick={handleOpenViewLogs}
              >
                VIEW LOGS
              </Button>
            ) : (
              <Box sx={{ fontWeight: 'bold' }}>UNSENT</Box>
            )
          },
        })
      } else {
        colData.push({
          field: item,
          headerName: headersFormat[item],
          width: 150,
          editable: false,
          sortable: false,
          disableColumnMenu: true,
        })
      }
    })

    const rowData = _reports.map((item, i) => ({
      id: i,
      docId: item.id,
      logs: item.logs,
      crop: item.crop,
      text_recommendation:
        item.smsRecommendations || 'No SMS Recommendations available',
      logs: item.logs,
      region: item.region,
      province: item.province,
      municipality: item.municipality,
      month: item.month,
      type: item.type,
      updated_by: item.updated_by,
      date_created: `${item.date_created.toDate().toDateString()}
          ${item.date_created
            .toDate()
            .toLocaleTimeString('it-IT', DAY_FORMAT_OPTIONS)}`,
    }))

    setRows(rowData)
    setColumns(colData)
  }

  useEffect(() => {
    /**
     * Snackbar will only appear of the router.query contains the flag "isSent".
     * This is to prevent unnecessary opening of Snackbar that's out of logic.
     */
    if (Object.keys(router.query)[0] === undefined) {
      setOpenSnackbar(false)
      setSnackbarDetails({})
    }

    if (Object.keys(router.query)[0] === 'isSent') {
      setContactsLoading(false)
      setOpenSnackbar(true)
      handleSnackbarDisplay({
        message:
          router.query.isSent === 'true'
            ? 'Successfully sent Crop Recommendation via text!'
            : 'Unsuccessful in sending Crop Recommendation via text.',
        severity: router.query.isSent === 'true' ? 'success' : 'error',
      })
    }
  }, [router])

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.push('/admin/login')
    }
  }, [auth.user, auth.loading, router])

  const handleReportTypeChange = (e) => {
    const { value } = e.target
    const fileredReports = reports.filter((report) => report.type === value)

    setReport(fetchSMS(fileredReports))
    dispatch(reportTypeReceived(value))
  }

  const handleSnackbarDisplay = (snackbarDetails) => {
    setSnackbarDetails(snackbarDetails)
  }

  const handleAddContact = async (newContact) => {
    try {
      setLoadingButton(true)
      const response = await createContact(newContact)

      if (response) {
        await _getContacts()
      }

      setLoadingButton(false)
      setOpenSnackbar(true)
      setSnackbarDetails({
        message: 'Successfully added a New Contact!',
        severity: 'success',
      })
    } catch (err) {
      console.error(err.message)
    }
  }

  const handleDeleteContact = async (deletedContact) => {
    try {
      setLoadingButton(true)
      const response = await deleteContact({ docId: deletedContact.id })
      setOpen(false)
      if (response) {
        await _getContacts()
      }
      setLoadingButton(false)
      setOpenSnackbar(true)
      setSnackbarDetails({
        openSnackbar: true,
        message: `Successfully deleted contact: ${
          deletedContact.name === ''
            ? deletedContact.cellnumber
            : deletedContact.name
        }!`,
        severity: 'success',
      })
    } catch (err) {
      console.error(err.message)
    }
  }

  const handleEditContact = async (editedContact) => {
    try {
      setLoadingButton(true)
      const response = await editContact({
        docId: editedContact.id,
        name: editedContact.name,
        cellnumber: editedContact.cellnumber,
        nickname: editedContact.nickname,
        province: editedContact.province,
        municipality: editedContact.municipality,
        subscribed_crops: editedContact.selectedCrops
      })
      setLoadingButton(false)
      setOpen(false)
      if (response) {
        await _getContacts()
      }
      setOpenSnackbar(true)
      setSnackbarDetails({
        openSnackbar: true,
        message: `Successfully edit contact: ${
          editedContact.name === ''
            ? editedContact.cellnumber
            : editedContact.name
        }!`,
        severity: 'success',
      })
    } catch (err) {
      console.error(err.message)
    }
  }

  const handleCloseViewLogs = () => {
    setOpenViewLogs(false)
  }

  return (
    <ProtectedPage
      loading={loading}
      user={user}
      onBtnLogoutClick={onBtnLogoutClick}
      accLevel={ACCOUNT_LEVEL.ADMIN}
    >
      <ViewLogs report={report} />
      <AdminSMS
        columns={columns}
        contacts={contacts}
        getContacts={_getContacts}
        handleAddContact={handleAddContact}
        handleDeleteContact={handleDeleteContact}
        handleEditContact={handleEditContact}
        handleReportTypeChange={handleReportTypeChange}
        loading={contactsLoading}
        loadingReports={loading}
        onBtnClick={onBtnLogoutClick}
        open={open}
        rows={rows}
        setOpen={setOpen}
        toAddContact={router.query.toAddContact}
        user={auth.user}
        loadingButton={loadingButton}
        regions={regions}
        province={province}
        setProvince={setProvince}
        municipality={municipality}
        setMunicipality={setMunicipality}
      />

      {!contactsLoading && openSnackbar && (
        <SimpleSnackbar
          openSnackbar={true}
          message={snackbarDetails.message}
          severity={snackbarDetails.severity}
          closeHandler={() => {
            setOpenSnackbar(false)
          }}
        />
      )}
    </ProtectedPage>
  )
}

export default withAuthListener(AdminSMSContainer)
