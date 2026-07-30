import { useState } from 'react'
import { Box, Grid, Tab, Tabs, Typography } from '@mui/material/'
import { TabPanel, a11yProps } from '@/common/ui/tabcontent'

import Phonebook from '@/components/admin/sms/phonebook'
import SMSTable from '@/components/admin/sms/smstable'
import styles from './styles'

function AdminSMS({
  columns,
  contacts,
  getContacts,
  handleAddContact,
  handleDeleteContact,
  handleEditContact,
  handleOpenAddContact,
  handleReportTypeChange,
  loading,
  loadingButton,
  loadingReports,
  open,
  rows,
  setOpen,
  toAddContact,
  regions,
  province,
  setProvince,
  municipality,
  setMunicipality
}) {
  /**
   * The purpose of toAddContact is for the redirection from ViewSMS
   * to SMS Table and immediately set the tab to the Phonebook
   * for adding contact/ease of access.
   *
   * If there's no redirection happening from ViewSMS, then the
   * SMS table will behave normally and show the SMS tab
   * first.
   */
  const [value, setValue] = useState(toAddContact ? 1 : 0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <div>
      <Typography variant="h5">SMS Management</Typography>
      <p>
        <strong>View Text (SMS) versions</strong> of generated Crop
        Recommendations and send them to different individuals via SMS.
      </p>
      <p>
        <strong>Manage your own phonebook</strong> for ease of sending texts to
        individuals.
      </p>

      <Box sx={styles.tabsContainer}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="SMS" {...a11yProps(0)} />
          <Tab label="PHONEBOOK" {...a11yProps(1)} />
        </Tabs>
        <Box>
          <TabPanel value={value} index={0}>
            <SMSTable
              columns={columns}
              handleReportTypeChange={handleReportTypeChange}
              loadingReports={loadingReports}
              rows={rows}
            />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Grid container>
              <Grid item xs={12} md={4}>
                <Phonebook
                  getContacts={getContacts}
                  handleAddContact={handleAddContact}
                  handleDeleteContact={handleDeleteContact}
                  handleEditContact={handleEditContact}
                  handleOpenAddContact={handleOpenAddContact}
                  loading={loading}
                  loadingButton={loadingButton}
                  open={open}
                  originalContacts={contacts}
                  setOpen={setOpen}
                  regions={regions}
                  province={province}
                  setProvince={setProvince}
                  municipality={municipality}
                  setMunicipality={setMunicipality}
                />
              </Grid>
            </Grid>
          </TabPanel>
        </Box>
      </Box>
    </div>
  )
}

export default AdminSMS
