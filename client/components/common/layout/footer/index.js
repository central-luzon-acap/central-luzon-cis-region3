import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { imageLoader, assetPrefixer } from '@/utils/img-loader'
import { useMediaQuery, useTheme } from '@mui/material'
import styles from './styles'
import urls from './links.js'

function Footer({ adminPage }) {
  const logos = ['da-rfo-logo', 'amia-logo', 'uplb-fi', 'ciat', 'PAGASA']
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const setDimensions = (logo) => {
    // [width, height]
    switch (logo) {
      case 'uplb-fi':
        return [250, 60]
      case 'ciat':
        return [120, 50]
      case 'PAGASA':
        return [60, 60]
      default:
        return [65, 65]
    }
  }

  const half = Math.ceil(urls.partners.length / 2)
  const firstHalf = urls.partners.slice(0, half)
  const secondHalf = urls.partners.slice(half)

  return (
    <Box sx={styles.footer} component="footer">
      {!adminPage && (
        <Grid container sx={styles.links}>
          <Grid item sm={8}>
            <Typography variant="body2">
              <strong>Partners</strong>
              </Typography>

            {isSmallScreen ? (
              <ul>
                {urls.partners.map((item, index) => (
                  <li key={index}>
                    <a href={item.url} target="_blank" rel="noreferrer">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <Grid container>
                <Grid item xs={12} sm={8}>
                  <ul>
                    {firstHalf.map((item, index) => (
                      <li key={index}>
                        <a href={item.url} target="_blank" rel="noreferrer">
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <ul>
                    {secondHalf.map((item, index) => (
                      <li key={index}>
                        <a href={item.url} target="_blank" rel="noreferrer">
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Grid>
              </Grid>
            )}
          </Grid>

          <Grid item sm={4}>
            <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginTop: adminPage ? 0 : '24px',
            }}
          >
            {logos.map((item, index) => (
              <Box sx={styles.gridItem} key={index}>
                <Grid item>
                  <Image
                    unoptimized
                    src={assetPrefixer(`images/logos/${item}.png`)}
                    height={setDimensions(item)[1]}
                    width={setDimensions(item)[0]}
                    loader={imageLoader}
                    alt={item}
                  />
                </Grid>
              </Box>
            ))}
          </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default Footer
