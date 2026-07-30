import Breadcrumbs from '@mui/material/Breadcrumbs'
import { Link as MuiLink } from '@mui/material'
import Link from 'next/link'
import styles from './styles'

function ReusableBreadcrumbs ({ navdata }) {
  return (
    <Breadcrumbs aria-label='breadcrumb' sx={styles.breacrumbs}>
      {navdata.map((item, index) => {
        return (item.href !== undefined)
          ? <MuiLink underline='hover' color='inherit' key={`bcd-${index}`}>
            <Link href={item.href} passHref>
              <span>{item.name}</span>
            </Link>
          </MuiLink>
          : <div color='text.primary' key={`bcd-${index}`}>{item.name}</div>
      })}
    </Breadcrumbs>
  )
}

export default ReusableBreadcrumbs
