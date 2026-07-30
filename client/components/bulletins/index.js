import Link from 'next/link'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import data from './pagedata'
import styles from './styles'

function Bulletins({ media }) {
  return (
    <Box sx={styles.container}>
      <Grid container maxWidth="lg" spacing={3}>
        {data.map((item, index) => (
          <Grid item key={index} xs={12} md={4}>
            <Card sx={styles.card}>
              <CardMedia
                placeholder={`/images/thumbnails/${item.img}.png`}
                component="img"
                height="225"
                srcSet={
                  media[index] !== undefined
                    ? media[index]
                    : `/images/thumbnails/${item.img}.png`
                }
                alt={item.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">
                  <Link href={item.href} passHref>
                    <a>View</a>
                  </Link>
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default Bulletins
