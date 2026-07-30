import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { REGIONAL_FIELD_OFFICE } from '@/utils/constants'

import useSupportServices from '@/hooks/support_services/usesupportservices'

import styles from './styles'

function SupportServices() {
  const { services, loading, error } = useSupportServices()

  return (
    <Box sx={styles.wrapper} id="contents-support-services">
      <Typography variant="h4">
        DA RFO {REGIONAL_FIELD_OFFICE} Support Services
      </Typography>

      <Card
        variant="outlined"
        sx={styles.card}
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
      >
        <Grid>
          {loading ? (
            <p>Loading data...</p>
          ) : (
            <>
              {error ? (
                <p>Something went wrong.</p>
              ) : (
                <>
                  {services.length ? (
                    <ul>
                      {services.map((service) => (
                        <li key={service.data}>{service.data}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No data available.</p>
                  )}
                </>
              )}
            </>
          )}
        </Grid>
      </Card>
    </Box>
  )
}

export default SupportServices
