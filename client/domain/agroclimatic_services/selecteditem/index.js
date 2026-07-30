import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import styles from './styles'

function SelectedItem ({ info, show = true, borderColor = '#cc00cc' }) {
  return (
    <Box sx={styles.container}>
      <Box sx={styles.cardContainer} style={{ borderColor }}>
        <Typography variant='subtitle1'>
          {`You have selected ${(info.from === 'cropstage') ? 'crop stage' : info.from}`}
        </Typography>
        <Typography variant='subtitle1'>
          {info.label}
        </Typography>
      </Box>
      {show && <ArrowDownwardIcon size={24} sx={styles.arrowIcon} style={{ color: borderColor }} />}
    </Box>
  )
}

export default SelectedItem
