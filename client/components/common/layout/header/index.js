import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import { useAuth } from '@/services/auth'
import { imageLoader, assetPrefixer } from '@/utils/img-loader'
import { ACCOUNT_LEVEL, REGION_CODE, REGION_NAME } from '@/utils/constants'
import Menu from '@mui/material/Menu'
import MenuItem from '../menuitem'
import SearchBarContainer from '@/common/entities/searchbar'
import items from './items'
import styles from './styles'
import stylesMenu from '../menuitem/styles'

import MenuIcon from '@mui/icons-material/Menu'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

const defaultState = Object.keys(items).reduce((x, y) => {
  x[y] = false
  return x
}, {})

const defaultSearchState = { search: false, loading: false, info: '', error: '' }

function Header () {
  const [state, setState] = useState(defaultState)
  const [anchorElNav, setAnchorElNav] = useState(null)
  const [searchState, setSearchState] = useState(defaultSearchState)
  const auth = useAuth()

  useEffect(() => {
    const resizeHeaders = () => {
      setAnchorElNav(null)
    }

    window.addEventListener('resize', resizeHeaders)

    return () => {
      window.removeEventListener('resize', resizeHeaders)
    }
  }, [])

  // Click a main navigation item
  const onMenuItemClick = (e, id, forceClose = false) => {
    if (forceClose) {
      // Close a sub-menu dropdown
      setState({...defaultState, [id]: true })
      setAnchorElNav(null)
    } else {
      // Display sub-menu dropdown items if main navigation item has subitems
      setState({...defaultState, [id]: true })
    }
  }

  // Display the small-screen main navigation menu
  const handleOpenMobileMenu = (e) => {
    setAnchorElNav(e.currentTarget)
  }

  // Close the Small screens main naviation menu
  const handleCloseMobileMenu = (e, id) => {
    setAnchorElNav(null)
    onMenuItemClick(id)
  }

  const handleSearchClick = () => {
    setSearchState(prev => ({ ...prev, search: !prev.search }))
  }

  return (
    <AppBar position='sticky' sx={styles.appbar}>
      <Container maxWidth='lg' sx={styles.container} id='header-contents'>

        {/** ACAP Logo - Fixed to the left side. */}
        <Link href='/' passHref>
          <Box sx={{ minHeight: { sm: 'none' }}}>
            <Box sx={styles.titleContainerFixed}>
              <Box sx={styles.title}>
                <Image
                  unoptimized
                  src={assetPrefixer('images/logos/amia-logo.png')}
                  height={100}
                  width={100}
                  loader={imageLoader}
                  alt={`Agro-Climatic Advisory Portal - ${REGION_CODE} (ACAP-${REGION_NAME})`} />
                <Box sx={styles.titleTextDesktop} >
                  <h5>
                    Agro-Climatic Advisory<br />
                    Portal - {REGION_NAME}
                  </h5>
                  <h4>
                    (ACAP-{REGION_NAME})
                  </h4>
                </Box>
              </Box>
            </Box>
          </Box>
        </Link>

        {/** ACAP Logo - Hidden. Retain this block for centered top navigation links spacing */}
        <Box sx={{ minHeight: { sm: 'none', visibility: 'hidden' }}}>
          <Box sx={styles.titleContainer} style={{ visibility: 'hidden' }}>
            <Box sx={styles.title} style={{ visibility: 'hidden' }}>
              <Image
                unoptimized
                src={assetPrefixer('images/logos/da-logo.png')}
                height={65}
                width={65}
                loader={imageLoader}
                alt={`${REGION_CODE} Agro-Climatic Advisory Portal`} />
              <Box sx={styles.titleTextDesktop} >
                <h5>
                  Agro-Climatic Advisory<br />
                  Portal - {REGION_NAME}
                </h5>
                <h4>
                  (ACAP-{REGION_NAME})
                </h4>
              </Box>
            </Box>
          </Box>
        </Box>

        <Toolbar variant='dense' disableGutters sx={styles.toolbar}>
          {/** START: Small screens Navigation Menu */}
          <Box sx={{ width: '100%', flexGrow: 1, justifyContent: 'space-between', display: { xs: 'flex', md: 'none' } }}>
            {/** Hamburger (Toggle menu) Icon */}
            <IconButton
              size='large'
              aria-label='account of current user'
              aria-controls='menu-appbar'
              aria-haspopup='true'
              onClick={handleOpenMobileMenu}
              color='inherit'
            >
              <MenuIcon />
            </IconButton>
            {/** ACAP Logo */}
            <Link href='/' passHref>
              <Box sx={styles.title} style={{
                display: (searchState.search) ? 'none' : 'flex',
                width: '100%',
                justifyContent: 'center'
              }}>
                <Image
                  unoptimized
                  src={assetPrefixer('images/logos/da-logo.png')}
                  height={75}
                  width={75}
                  loader={imageLoader}
                  alt={`${REGION_CODE} Agro-Climatic Advisory Portal`} />
                <div className='acap-title'>
                  <h5>
                    Agro-Climatic Advisory<br />
                    Portal - {REGION_NAME}
                  </h5>
                  <h4>
                    (ACAP-{REGION_NAME})
                  </h4>
                </div>
              </Box>

            </Link>

            {/** Search Bar */}
            {searchState.search &&
            <SearchBarContainer
              search={searchState.search}
              handleSearchClick={handleSearchClick} />}

            {/** Small Screens Main (Dropdown) Menu */}
            <Menu
              id='menu-appbar'
              elevation={0}
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseMobileMenu}
              sx={stylesMenu.menuContainerRegular}
            >
              {/** Small Screens Sub-items Menu */}
              {Object.keys(items).map((item, index) => {
                const isParent = items[item].subitems.length > 0

                return <MenuItem
                  href={items[item].href}
                  name={items[item].name}
                  id={item}
                  key={index}
                  active={state[item]}
                  isParent={isParent}
                  isNavItem={false}
                  IconMain={ArrowDropDownIcon}
                  IconSub={ArrowForwardIcon}
                  subitems={items[item].subitems}
                  // searchopts={searchState.search}
                  onItemClick={onMenuItemClick} />
              })}

              <MenuItem
                href={auth.user !== null
                  ? auth.user.accountlevel === ACCOUNT_LEVEL.ADMIN
                    ? '/admin'
                    : '/superadmin'
                  : '/admin/login' }
                name={auth.user !== null
                  ? auth.user.accountlevel === ACCOUNT_LEVEL.ADMIN
                    ? 'Admin'
                    :'Superadmin' : 'Login'}
                id='admin'
                active={false}
                isNavItem={false}
                layout='vertical'
                // searchopts={searchState.search}
                onItemClick={() => handleCloseMobileMenu('admin')} />

              <MenuItem
                href='#'
                name='Search'
                id='sm-search'
                active={false}
                isNavItem={false}
                layout='vertical'
                // searchopts={searchState.search}
                preventnavs={true}
                onItemClick={(e) => {
                  handleCloseMobileMenu(e, 'sm-search')
                  handleSearchClick()
                }} />
            </Menu>
          </Box>
          {/** END: Small screens Navigation Menu */}

          {/** START: Regular/Large screens Navigation Menu */}
          <Box sx={{ flexGrow: 1, justifyContent: 'flex-end', alignItems: 'center', display: { xs: 'none', md: 'flex' } }}>
            {/** Main Menu (Top Navigation) Items and Dropdown Menu*/}
            {Object.keys(items).map((item, index) => {
              const isParent = items[item].subitems.length > 0

              return <MenuItem
                href={items[item].href}
                name={items[item].name}
                id={item}
                key={index}
                active={state[item]}
                isParent={isParent}
                IconMain={ArrowDropDownIcon}
                IconSub={ArrowForwardIcon}
                subitems={items[item].subitems}
                searchopts={searchState.search}
                onItemClick={(e) => onMenuItemClick(e, item)} />
            })}

            <MenuItem
              href={auth.user !== null
                ? auth.user.accountlevel === ACCOUNT_LEVEL.ADMIN
                  ? '/admin'
                  : '/superadmin'
                : '/admin/login' }
              name={auth.user !== null
                ? auth.user.accountlevel === ACCOUNT_LEVEL.ADMIN
                  ? 'Admin'
                  :'Superadmin' : 'Login'}
              id='admin'
              active={false}
              searchopts={searchState.search}
              onItemClick={() => {}} />

            {/** Search Bar (Desktop */}
            <SearchBarContainer
              search={searchState.search}
              handleSearchClick={handleSearchClick} />
          </Box>
          {/** END: Regular/Large screens Navigation Menu */}
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Header
