import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'

import Box from '@mui/material/Box'
import BulletinSelector from '@/domain/admin/bulletins/bulletin_selector'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import PaperBgSoft from '@/common/ui/paperbgsoft'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import SimpleSnackbar from '@/common/ui/snackbar'
import { REPORT_TYPE } from '@/utils/constants/app'

import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton } from '@mui/x-data-grid'
import { ADAPTER_STATES } from '@/store/constants'

function CustomToolbar(props) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <GridToolbarContainer {...props}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
      </GridToolbarContainer>
    </Box>
  )
}

function AdminCropsBulletins ({
  rows,
  columns,
  message,
  resetMessage,
  handleTypeChange,
}) {
  const [type, setType] = useState(REPORT_TYPE.SEASONAL)
  const repLoading = useSelector((state) => state.reports.status)
  const reportType = useSelector((state) => state.dashboard.reportType)
  const router = useRouter()

  useEffect(() => {
    setType(reportType)
  }, [reportType])

  return (
    <div>
      <SimpleSnackbar
        openSnackbar={message !== ''}
        message={message}
        severity='info'
        closeHandlerCB={resetMessage}
      />

      <Typography variant='h5'>Generate Bulletin</Typography>
      <p>Create and preview <strong>10-Day</strong> and <strong>Seasonal</strong> crop bulletins. Finalized bulletins will be automatically uploaded to the site for public download.</p>

      <PaperBgSoft sx={{
        display: 'flex',
        flexDirection: {
          sm: 'column',
          md: 'row'
        },
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px 8px 24px'
      }}>
        <BulletinSelector />
        <FormControl sx={{
          m: 1,
          width: {
            xs: '100%',
            sm: '100%',
            md: 300
          },
        }} size='small'>
          <InputLabel id='report-type'>Bulletin Type</InputLabel>
          <Select
            labelId='report-type'
            id='report-type'
            value={type}
            label='Bulletin Type'
            onChange={handleTypeChange}
          >
            <MenuItem value={REPORT_TYPE.SEASONAL}>Seasonal Crop Recommendations</MenuItem>
            <MenuItem value={REPORT_TYPE.TEN_DAY}>10-Day Crop Recommendations</MenuItem>
            <MenuItem value={REPORT_TYPE.SPECIAL_WEATHER}>Special Weather Recommendations</MenuItem>
          </Select>

        </FormControl>
      </PaperBgSoft>

      <Box style={{ height: 678, width: '100%', textAlign: 'left' }}>
        <PaperBgSoft sx={{ height: 'inherit', marginTop: '16px' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableDensitySelector
          pageSize={10}
          rowsPerPageOptions={[10]}
          components={{ Toolbar: CustomToolbar }}
          loading={repLoading === ADAPTER_STATES.PENDING}
          rowHeight={48}
          initialState={{
            columns: {
              columnVisibilityModel: {
                rowId: false
              }
            }
          }}
          onRowClick={(params) => {
            router.push({
              pathname: '/admin/bulletins/crops/report/view',
              query: { docId: params.row.docId }
            })
          }}
        />
        </PaperBgSoft>
      </Box>
    </div>
  )
}

export default AdminCropsBulletins
