import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import styles from './styles'

// Rainfall is only reported by PAGASA as a category, not a numeric mm value.
// We map each category to a relative severity level (0-3) so the bars are
// honest about what the underlying data actually represents.
const SEVERITY = {
  'NO RAIN': 0,
  'LIGHT RAINS': 1,
  'MODERATE RAINS': 2,
  'HEAVY RAINS': 3,
}

const SEVERITY_COLOR = ['#c8d8c8', '#8bc34a', '#4a90d9', '#2b5fa8']

const CHART_HEIGHT = 90
const BAR_MAX_HEIGHT = 70

function RainfallChart({ forecast = [] }) {
  if (forecast.length === 0) {
    return null
  }

  return (
    <Box sx={styles.wrapper}>
      <Box sx={styles.chartRow} style={{ height: CHART_HEIGHT }}>
        {forecast.map((item, index) => {
          const severity = SEVERITY[item.rainfall] ?? 0
          const barHeight =
            severity === 0 ? 4 : (severity / 3) * BAR_MAX_HEIGHT

          const label =
            item.rainfall !== undefined
              ? `${item.rainfall.charAt(0)}${item.rainfall
                  .slice(1)
                  .toLowerCase()}`
              : 'No data'

          return (
            <Tooltip
              key={`bar-${index}`}
              title={`${item.day}: ${label}`}
              arrow
            >
              <Box sx={styles.barColumn}>
                <Box
                  sx={styles.bar}
                  style={{
                    height: `${barHeight}px`,
                    backgroundColor: SEVERITY_COLOR[severity],
                  }}
                />
                <span className="bar-day">{item.day}</span>
              </Box>
            </Tooltip>
          )
        })}
      </Box>

      <Box sx={styles.legend}>
        {['No rain', 'Light', 'Moderate', 'Heavy'].map((label, idx) => (
          <span className="legend-item" key={label}>
            <span
              className="legend-swatch"
              style={{ backgroundColor: SEVERITY_COLOR[idx] }}
            />
            {label}
          </span>
        ))}
      </Box>
    </Box>
  )
}

export default RainfallChart
