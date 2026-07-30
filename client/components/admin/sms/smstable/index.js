import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { DataGrid } from '@mui/x-data-grid'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

import { REPORT_TYPE } from '@/utils/constants/app'

function SMSTable({ columns, loadingReports, rows, handleReportTypeChange }) {
  const [type, setType] = useState(REPORT_TYPE.SEASONAL)
  const reportType = useSelector((state) => state.dashboard.reportType)

  useEffect(() => {
    setType(reportType)
  }, [reportType])

  return (
    <div>
      {columns.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '10px',
          }}
        >
          <FormControl
            sx={{
              m: 1,
              width: {
                xs: '100%',
                sm: '100%',
                md: 300,
              },
            }}
            size="small"
          >
            <InputLabel id="report-type">Bulletin Type</InputLabel>
            <Select
              labelId="report-type"
              id="report-type"
              value={type}
              label="Bulletin Type"
              onChange={handleReportTypeChange}
            >
              <MenuItem value={REPORT_TYPE.SEASONAL}>
                Seasonal Crop Recommendations
              </MenuItem>
              <MenuItem value={REPORT_TYPE.TEN_DAY}>
                10-Day Crop Recommendations
              </MenuItem>
              <MenuItem value={REPORT_TYPE.SPECIAL_WEATHER}>
                Special Weather Recommendations
              </MenuItem>
            </Select>
          </FormControl>
        </div>
      )}

      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loadingReports}
          pageSize={5}
          rowsPerPageOptions={[5]}
        />
      </div>
    </div>
  )
}

export default SMSTable
