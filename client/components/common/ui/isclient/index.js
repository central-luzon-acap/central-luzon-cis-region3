import { useState, useEffect } from 'react'

// Renders Components only after this component has mounted (windows, document, etc are ready)
// Alternate fix for "Warning: Prop `className` did not match." console warning error on NextJS 12.0.0
// Alternate way of doing dynamic(() => import('@/layout/<some_component>'), { ssr: false })
function IsClientOnly ({ children }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted ?
    children : null
}

export default IsClientOnly
