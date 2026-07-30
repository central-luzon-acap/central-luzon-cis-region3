import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import PostAddIcon from '@mui/icons-material/PostAdd'
import SettingsIcon from '@mui/icons-material/Settings'
import FaceTwoToneIcon from '@mui/icons-material/FaceTwoTone'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined'

const adminPageLinks = [
  {
    text: 'Get Started',
    link: '/admin',
    icon: <HomeTwoToneIcon />,
  },
  {
    text: 'ACAP Settings',
    link: '/admin/weather',
    icon: <SettingsIcon />,
  },
  {
    text: 'Generate Bulletin',
    link: '/admin/bulletins/crops',
    icon: <PostAddIcon />,
  },
  {
    text: 'SMS Management',
    link: '/admin/sms',
    icon: <MailOutlineIcon />,
  },
  {
    text: 'Cropping Calendars',
    link: '/admin/cropping-calendars',
    icon: <CalendarMonthOutlinedIcon />,
  },
  {
    text: 'Manage Recommendations',
    link: '/admin/manage-recommendations',
    icon: <TipsAndUpdatesOutlinedIcon />,
  },
]

const adminLowerListLinks = [
  {
    text: 'Profile',
    link: '/admin/profile',
    icon: <FaceTwoToneIcon />,
  },
]

export { adminPageLinks, adminLowerListLinks }
