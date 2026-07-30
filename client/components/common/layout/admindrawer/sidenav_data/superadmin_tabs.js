import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone'
import FaceTwoToneIcon from '@mui/icons-material/FaceTwoTone'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'

const superadminPageLinks = [
  {
    text: 'Get Started',
    link: '/superadmin',
    icon: <HomeTwoToneIcon />,
  },
  {
    text: 'Users',
    link: '/superadmin/users',
    icon: <FactCheckOutlinedIcon />,
  }
]

const superadminLowerListLinks = [
  {
    text: 'Profile',
    link: '/superadmin/profile',
    icon: <FaceTwoToneIcon />,
  },
]

export {
  superadminPageLinks,
  superadminLowerListLinks
}
