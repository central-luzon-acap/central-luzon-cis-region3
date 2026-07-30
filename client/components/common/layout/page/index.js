import dynamic from 'next/dynamic'
import Box from '@mui/material/Box'
import Footer from '../footer'
import Section from '../section'

// Fixes: "Warning: Prop `className` did not match." on NextJS 12.0.0
const Header = dynamic(() => import('../header'), { ssr: false })

function Page ({ children, customLayout = false, adminPage = false }) {
  const navBarHeaderHeight = (adminPage) ? '0px' : '98px'
  const footerHeight = '119px'
  const boxHeight = customLayout
    ? `calc(100vh - ${navBarHeaderHeight} - ${footerHeight})`
    : `calc(100vh - ${footerHeight})`

  return (
    <Box sx={{ width: '100%', height: boxHeight }}>
      {customLayout ?
        (
          <div style={{ minHeight: '100%', backgroundColor: '#F7FAFC' }}>
            { children }
          </div>
        ) :
        (
          <div style={{ minHeight: '100%' }}>
            <Header />
            <Section>
              { children }
            </Section>
          </div>
        )
      }

      <Footer adminPage={adminPage}/>
    </Box>
  )
}

export default Page
