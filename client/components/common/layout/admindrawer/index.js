import { useMemo, useEffect, useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ACCOUNT_LEVEL } from '@/utils/constants'

// Common Icons
import AppShortcutTwoToneIcon from '@mui/icons-material/AppShortcutTwoTone'
import ExitToAppTwoToneIcon from '@mui/icons-material/ExitToAppTwoTone'
import MenuIcon from '@mui/icons-material/Menu'

import {
  adminPageLinks,
  adminLowerListLinks,
} from './sidenav_data/admin_tabs'
import {
  superadminPageLinks,
  superadminLowerListLinks,
} from './sidenav_data/superadmin_tabs'
import styles from './styles'

const drawerWidth = 280

const commonLowerLinks = [
  {
    text: 'ACAP Website',
    link: '/',
    icon: <AppShortcutTwoToneIcon />,
  },
  {
    text: 'Logout',
    link: '#',
    icon: <ExitToAppTwoToneIcon />,
  },
]

export default function AdminDrawer(props) {
  const { window } = props
  const [mobileOpen, setMobileOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const router = useRouter()
  const { user, onBtnLogoutClick } = props

  const pageLinks = useMemo(() => {
    if (!user) return

    return user.accountlevel === ACCOUNT_LEVEL.ADMIN
      ? adminPageLinks
      : superadminPageLinks
  }, [user])

  const lowerListLinks = useMemo(() => {
    if (!user) return

    return [...(user.accountlevel === ACCOUNT_LEVEL.ADMIN)
      ? adminLowerListLinks
      : superadminLowerListLinks,
      ...commonLowerLinks
    ]
  }, [user])

  useEffect(() => {
    if (
      !router?.route ||
      !pageLinks ||
      !lowerListLinks
    ) return

    const routes = [...pageLinks, ...lowerListLinks]
    const selected = routes.find(item => item.link === router.route)

    setSelectedItem(selected?.link)
  }, [props.user.accountlevel, router.route, pageLinks, lowerListLinks])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List sx={styles.list} disablePadding>
        {pageLinks.map((item) => (
          <Link href={item.link} passHref key={item.link}>
            <ListItemButton
              className="listitembutton-styled"
              selected={selectedItem === item.link}
              key={item.label}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: 'medium',
                }}
              >
                <a href={item.link}>
                  {item.text}
                </a>
              </ListItemText>
            </ListItemButton>
          </Link>
        ))}
      </List>
      <Divider />
      <List sx={styles.list}>
        {lowerListLinks.map((item, index) => {
          if (item.text === 'Logout') {
            return (
              <Link href={item.link} key={item.link} passHref>
                <ListItemButton
                  className="listitembutton-styled"
                  selected={selectedItem === item.link}
                  onClick={onBtnLogoutClick}
                >
                  <ListItemIcon sx={{ color: 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: 'medium',
                    }}
                  />
                </ListItemButton>
              </Link>
            )
          }

          return (
            <Link href={item.link} key={index} passHref>
              <ListItemButton
                className="listitembutton-styled"
                selected={selectedItem === item.link}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: 'medium',
                  }}
                >
                  <a href={item.link}>
                    {item.text}
                  </a>
                </ListItemText>
              </ListItemButton>
            </Link>
          )
        })}
      </List>
    </div>
  )

  const container =
    window !== undefined ? () => window().document.body : undefined

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={styles.toolbar}>
          <div>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              ACAP Admin
            </Typography>
          </div>
          <Box sx={styles.profileToolbar}>Welcome, {user.email}!</Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              boxShadow: '0px 0px 20px rgb(1 41 112 / 10%)',
              color: '#444444',
              border: 'none',
              backgroundColor: '#fff',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: {
            xs: '16px 0 0 0',
            sm: '24px 24px 24px 24px'
          },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">{props.children}</Container>
      </Box>
    </Box>
  )
}
