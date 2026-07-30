import { createTheme } from '@mui/material/styles'
import { red } from '@mui/material/colors'

// Create a theme instance.
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      smol: 320,
      xs2: 465,
      b4xs: 501,
      xs3: 566,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    // Blue
    primary: {
      main: '#232c5e',
      light: '#ced3ef',
      lighter: '#e4e2ff',
      dark: '#000134'
    },
    // ACAP Green
    secondary: {
      main: '#438364',
      light: '#6ed6a4',
      dark: '#11563a'
    },
    // Yellow (extra)
    third: {
      main: '#f3b23e',
      light: '#ffe46f',
      dark: '#bc8300'
    },
    // Lighter green
    green: {
      main: '#8BC34A',
      light: '#DCEDC8',
      dark: '#689F38'
    },
    error: {
      main: red.A400,
    },
    bacap: {
      border: '#E2E8F0',
      card: {
        background: '#FFFFFF',
        boxShadow: 'rgb(0 0 0 / 2%) 0px 3.5px 5.5px',
        borderRadius: '16px'
      }
    }
  },
  constants: {
    navbar: {
      outerHeight: 98
    },
    footer: {
      height: 119
    }
  }
})

export default theme