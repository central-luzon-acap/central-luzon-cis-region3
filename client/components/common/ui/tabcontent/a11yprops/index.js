function a11yProps(index) {
  return {
    id: `custom-tab-${index}`,
    'aria-controls': `custom-tabpanel-${index}`,
  }
}

export default a11yProps
