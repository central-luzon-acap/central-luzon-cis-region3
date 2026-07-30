import { useMemo } from 'react'

import PropTypes from 'prop-types'
import Image from 'next/image'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { assetPrefixer, imageLoader } from '@/utils/img-loader'
import styles from './styles'

const selectionsCommon = [
  { key: 'sel_crop', label: 'Crop' },
  { key: 'sel_province', label: 'Province' },
]

const selectionsRegular = [
  { key: 'sel_month', label: 'Months' },
  { key: 'climate_risk', label: 'Climate Risk' },
  { key: 'sel_stage', label: 'Crop Stages' },
  { key: 'sel_activity', label: 'Activities' },
]

const selectionsSpecial = [
  { key: 'sel_typhoon', label: 'Typhoon Name' },
  { key: 'sel_signal', label: 'Wind Signal' },
]

const NoDataAvailable = () => {
  return (
    <Typography variant="caption" color="orange">
      <strong>No data available.</strong>
    </Typography>
  )
}

function SelectionSummary({
  cropstages,
  climateRisk,
  selecteditems,
  farmoperations,
  loading,
  reportType = 'seasonal',
}) {
  const selections = useMemo(() => {
    return reportType === 'special'
      ? [...selectionsSpecial, ...selectionsCommon]
      : [...selectionsCommon, ...selectionsRegular]
  }, [reportType])

  const isCoverVisible = useMemo(() => {
    if (reportType === 'special') {
      return selecteditems?.sel_signal === null
    } else {
      return selecteditems?.sel_province === null
    }
  }, [reportType, selecteditems])

  return (
    <Box sx={styles.selectionSummary}>
      <Typography variant="h6">Selection Summary</Typography>
      {isCoverVisible ? (
        <Box
          sx={{
            ...styles.welcome,
            ...(reportType === 'special' && { minHeight: '184px' }),
          }}
        >
          <Image
            unoptimized
            src={assetPrefixer('images/icons/finance.svg')}
            height={85}
            width={85}
            loader={imageLoader}
            alt="Empty data"
          />
          <Box sx={{ marginTop: '16px' }}>
            <Typography variant="subtitle2">
              Crop Recommendations PDF Bulletins Creator
            </Typography>

            <Typography variant="subtitle2">
              Please select a province to start.
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            ...styles.summary,
            ...(reportType === 'special' && { minHeight: '184px' }),
          }}
        >
          {selections.map((item, idx) => {
            let itemvalue = '-'

            switch (item.key) {
              case 'sel_activity':
                itemvalue =
                  selecteditems.sel_crop !== null
                    ? farmoperations || <NoDataAvailable />
                    : ''
                break
              case 'sel_month':
                itemvalue =
                  selecteditems[item.key] !== null
                    ? selecteditems[item.key].label
                    : '-'
                break
              case 'climate_risk':
                itemvalue = climateRisk
                break
              case 'sel_stage':
                itemvalue =
                  selecteditems.sel_crop !== null
                    ? cropstages || <NoDataAvailable />
                    : ''
                break
              case 'sel_signal':
                itemvalue =
                  selecteditems[item.key] !== null
                    ? selecteditems[item.key]?.label
                    : ''
                break
              case 'sel_typhoon':
              default:
                itemvalue =
                  selecteditems[item.key] !== null
                    ? selecteditems[item.key]
                    : ''
                break
            }

            let monthLabel = item.label

            if (item.key === 'sel_month' && reportType === 'tenday') {
              monthLabel = 'Date'
            }

            // if (item.key === 'sel_stage' && reportType === 'tenday') {
            //   /console.log('itemvalue:', itemvalue)
            // }

            return (
              <div key={`selected-${idx}`}>
                <Typography
                  variant="subtitle2"
                  style={{ display: 'inline-block' }}
                >
                  {monthLabel}: &nbsp;
                </Typography>
                <Typography variant="body2" style={{ display: 'inline-block' }}>
                  {['sel_activity'].includes(item.key) ? (
                    loading ? (
                      <span>loading...</span>
                    ) : (
                      itemvalue
                    )
                  ) : (
                    itemvalue
                  )}
                </Typography>
              </div>
            )
          })}
        </Box>
      )}

      {selecteditems.error !== '' && (
        <Typography variant="caption" sx={{ color: 'red' }}>
          {selecteditems.error}
        </Typography>
      )}
    </Box>
  )
}

SelectionSummary.propTypes = {
  selecteditems: PropTypes.object,
  farmoperations: PropTypes.string,
  loading: PropTypes.bool,
  reportType: PropTypes.string,
}

export default SelectionSummary
