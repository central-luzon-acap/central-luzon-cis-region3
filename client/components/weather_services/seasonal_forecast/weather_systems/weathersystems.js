import Grid from '@mui/material/Grid'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import PaperBgSoft from '@/common/ui/paperbgsoft'
import CaptionText from '@/common/ui/captiontext'
import LoadingTable from '@/common/ui/loadingtable'
import { SEASONAL_UPDATE_METHOD } from '@/utils/constants'
import styles from './styles'

function WeatherSystemsComponent ({
  weathersystems,
  tableData,
  monthHeaders,
  updatedBy
}) {
  return (
    <Grid container spacing={2} sx={styles.container}>
      {tableData.length === 0
        ? <LoadingTable rows={6} cols={9} />
        : <>
          {/** Weather Systems Item List */}
          <Grid item sm={12} md={4} sx={{ width: '100%' }}>
            <PaperBgSoft sx={styles.itemList}>
              {weathersystems.length > 0 &&
                <ul>
                  {weathersystems.map((item, index) => (
                    <li key={index}>{item.value}</li>
                  ))}
                </ul>
              }

              <CaptionText>
                Updated by {updatedBy.miscUpdater} on {updatedBy.miscDate}
              </CaptionText>
            </PaperBgSoft>
          </Grid>

          {/** Weather Systems Table Data */}
          <Grid item sm={12} md={8} sx={{ width: '100%' }}>
            <TableContainer sx={styles.tablecontainer}>
              <Table size='medium' sx={styles.table}>
                <caption>
                  {updatedBy.seasonalMethod === SEASONAL_UPDATE_METHOD.EXCEL
                    ? <CaptionText>
                        Updated via file upload of PAGASA&apos;s shared seasonal weather forecast excel file by an admin on {updatedBy.seasonalDate}.<br />
                        Full reference is available on PAGASA&apos;s <a href='https://www.pagasa.dost.gov.ph/climate/climate-prediction/seasonal-forecast' target='_blank' rel="noreferrer">Seasonal (Rainfall) Forecast</a> web page.
                      </CaptionText>
                    : <CaptionText>
                        Updated by an admin on {updatedBy.seasonalDate}
                      </CaptionText>
                    }
                </caption>
                <TableHead>
                  <TableRow sx={styles.tableRowHeader}>
                    <TableCell rowSpan={2} width='8%'>Month</TableCell>
                    <TableCell rowSpan={2} width='12%' sx={styles.border}>Tropical Cyclones</TableCell>
                    <TableCell rowSpan={2} sx={styles.border}>Prov</TableCell>
                    <TableCell colSpan={6}>No. of Dry Days</TableCell>
                  </TableRow>
                  <TableRow sx={styles.tableRowHeader}>
                    {monthHeaders.map((month, index) => (
                      <TableCell key={index}>{month}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableData.map((rowData, rIndex) => (
                    <TableRow key={rIndex}>
                      {rowData.map((cellData, cIndex) => (
                        <TableCell key={cIndex}>{cellData}</TableCell>
                      ))}
                    </TableRow>
                  ))}

                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          </>
      }
    </Grid>
  )
}

export default WeatherSystemsComponent
