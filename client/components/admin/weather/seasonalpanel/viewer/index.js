import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import EmptyState from '@/common/ui/empty_state'
import LoadingTable from '@/common/ui/loadingtable'
import {
  WEATHER_CONDITION_COLORS,
  WEATHER_CONDITION_LABELS,
  SEASONAL_UPDATE_METHOD,
  NO_DATA_AVAILABLE,
  NO_DATA_AVAILABLE_VALUE
} from '@/utils/constants'
import { ADAPTER_STATES } from '@/store/constants'
import { fetchSeasonalWeather } from '@/store/weather/seasonal/seasonalThunks'
import CaptionText from '@/common/ui/captiontext'
import { displayNdaOrValue } from '@/utils/common'
import styles from '../styles'

const defaultSummary = { updated_by: '-', date_created: '', monthLabels: [] }

function RainfallViewer ({ withBorder=false }) {
  const [summary, setSummary] = useState(defaultSummary)
  const [pageInitialized, setPageInitialized] = useState(false)
  const mounted = useRef(false)
  const router = useRouter()
  const dispatch = useDispatch()

  useEffect(() => {
    mounted.current = true

    // Prevent state updates if the component was unmounted
    return () => {
      mounted.current = false
    }
  }, [])

  const {
    ids: sIds,
    status: fsLoading,
    entities: seasonalData,
  } = useSelector((state) => state.seasonalweather)

  useEffect(() => {
    dispatch(fetchSeasonalWeather())
      .unwrap()
      .then(() => {
        if (mounted.current) {
          setPageInitialized(true)
        }
      })
  }, [dispatch])

  useEffect(() => {
    if (fsLoading === ADAPTER_STATES.FULLFILLED && sIds.length > 0 && pageInitialized) {
      const info = seasonalData[sIds[0]]

      if (!mounted.current) {
        return
      }

      setSummary(prev => ({
        ...prev,
        updated_by: (router.pathname === '/admin/weather')
          ? info.updated_by
          : 'an admin',
        update_method: info.update_method,
        date_created: info.date_created,
        monthLabels: info.months.map(month => `${month.mo.charAt(0).toUpperCase()}${month.mo.slice(1)} ${month.year}`)
      }))
    }
  }, [seasonalData, fsLoading, sIds, router.pathname, pageInitialized])

  const TableMainContainer = ({ children }) => {
    if (withBorder) {
      return <TableContainer sx={styles.tablecontainer}>
        {children}
      </TableContainer>
    }

    return <TableContainer>{children}</TableContainer>
  }

  const ndaBgColor = (value) => {
    return (value === NO_DATA_AVAILABLE_VALUE)
      ? WEATHER_CONDITION_COLORS[NO_DATA_AVAILABLE]
      : 'none'
  }

  return (
    <div>
      {(fsLoading === ADAPTER_STATES.PENDING)
        ? // Skeleton loader, fsLoading
        <LoadingTable rows={7} cols={7} />
        : (sIds.length > 0)
          ? // Content
          <TableMainContainer sx={{ width: '650px' }}>
            <Table aria-label='simple table' size='small' sx={styles.table}>
              {/** Table Headers */}
              <TableHead>
                <TableRow sx={styles.tableRowHeader}>
                  <TableCell sx={{ width: '15%' }} rowSpan={2}>Province</TableCell>
                  {summary.monthLabels.map((item, index) => (
                    <TableCell sx={styles.headerMonths} key={`${item}-${index}`} colSpan={3}>
                      {item}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow sx={styles.tableRowHeader}>
                  {[...new Array(summary.monthLabels.length * 3)].fill('').map((item, index) => {
                    const idx = index + 1

                    if (idx === 1) {
                      return <td key={idx}>Normal (mm)</td>
                    } else {

                      if (idx % 3 === 1) {
                        return <td key={idx}>Normal (mm)</td>
                      }

                      if (idx % 3 === 2) {
                        return <td key={idx}>Forecast (mm)</td>
                      }

                      if (idx % 3 === 0) {
                        return <td key={idx}>% of Normal</td>
                      }
                    }
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.values(seasonalData).map((item) => (
                  <TableRow key={item.name} sx={styles.cellData}>
                    <TableCell>
                      {item.name}
                    </TableCell>
                    {[...new Array(summary.monthLabels.length * 3)].fill('').map((itm, idx) => {
                      const cIndex = idx + 1

                      // Normal (mm) column
                      if (cIndex === 1) {
                        return <td key={idx} style={{
                          backgroundColor: ndaBgColor(item.months[idx].normal)
                        }}>
                          {displayNdaOrValue(item.months[0].normal)}
                        </td>
                      } else {
                        if (cIndex % 3 === 1) {
                          return <td key={idx} style={{
                            backgroundColor: ndaBgColor(item.months[idx / 3].normal)
                          }}>
                            {displayNdaOrValue(item.months[idx / 3].normal)}
                          </td>
                        }

                        // Forecast (mm) column
                        if (cIndex % 3 === 2) {
                          const mnIndex = (cIndex + 1) / 3
                          return <td key={idx} style={{
                            backgroundColor: ndaBgColor(item.months[mnIndex - 1].mean)
                          }}>
                            {displayNdaOrValue(item.months[mnIndex - 1].mean)}
                          </td>
                        }

                        // % of Normal column
                        if (cIndex % 3 === 0) {
                          const mIndex = (cIndex / 3) - 1
                          return <TableCell
                            key={idx}
                            sx={{
                              backgroundColor: WEATHER_CONDITION_COLORS[item.months[mIndex].con],
                              textAlign: 'center',
                              color: ['above_normal', 'wb_normal']
                                .includes(item.months[mIndex].con) ? '#fff !important' : '#000'
                            }}
                          >
                            {displayNdaOrValue(item.months[mIndex].val)}
                          </TableCell>
                        }
                      }
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Box sx={styles.legend}>
              {summary.update_method === SEASONAL_UPDATE_METHOD.EXCEL
                ? <CaptionText>
                    Updated via file upload of PAGASA&apos;s shared seasonal weather<br /> forecast excel file by {summary.updated_by} on &nbsp;
                    {summary.date_created}.<br /><br />
                    Full reference is available on PAGASA&apos;s <a href='https://www.pagasa.dost.gov.ph/climate/climate-prediction/seasonal-forecast' target='_blank' rel="noreferrer">Seasonal (Rainfall) Forecast</a> web page.
                  </CaptionText>
                : <CaptionText>
                    Encoded with reference from PAGASA&apos;s <a href='https://www.pagasa.dost.gov.ph/climate/climate-prediction/seasonal-forecast' target='_blank' rel="noreferrer">Seasonal (Rainfall) Forecast</a> web page <br />
                    by {summary.updated_by} on &nbsp;
                    {summary.date_created}
                  </CaptionText>
              }

              <ul>
                {Object.values(WEATHER_CONDITION_LABELS).map((condition) => (
                  <li key={condition.id}>
                    <span style={{ backgroundColor: WEATHER_CONDITION_COLORS[condition.label] }}></span>
                    {condition.sync} ({condition.content})
                  </li>
                ))}
              </ul>
            </Box>
          </TableMainContainer>
          : <EmptyState />
      }
    </div>
  )
}

export default RainfallViewer
