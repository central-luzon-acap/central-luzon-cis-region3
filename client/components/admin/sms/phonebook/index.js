import { useEffect, useState, useCallback } from 'react'
import { Button } from '@mui/material/'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
// import _ from 'lodash'

import AddContact from './create'
import ViewContact from './view'
import SimpleSnackbar from '@/common/ui/snackbar'

function Phonebook({
  handleAddContact,
  handleDeleteContact,
  handleEditContact,
  loading,
  loadingButton,
  open,
  originalContacts,
  setOpen,
  regions,
  province,
  setProvince,
  municipality,
  setMunicipality,
}) {
  const [contact, setContact] = useState(null)
  const [contacts, setContacts] = useState(originalContacts)
  const [groupedContacts, setGroupContacts] = useState(null)
  // const [isSearchKeywordNaN, setIsSearchKeywordNaN] = useState(false)
  // const [globalSearchKeyword, setGlobalSearchKeyword] = useState('')
  const [addContactOpen, setAddContactOpen] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarDetails, setSnackbarDetails] = useState({})

  // Listen for updates to the original contacts list
  useEffect(() => {
    setContacts(originalContacts)
  }, [originalContacts])

  useEffect(() => {
    if (originalContacts.length !== 0) {
      groupContacts(originalContacts)
    }
  }, [groupContacts, originalContacts])

  const handleOpenAddContact = () => {
    // This for opening the AddContact modal
    setAddContactOpen(true)
    setProvince('')
    setMunicipality('')
  }

  const handleClick = (contact) => {
    // This is for opening ViewContact modal
    setOpenSnackbar(false)
    setSnackbarDetails({})
    setOpen(true)
    setContact(contact)
  }

  const handleClose = () => {
    // This is for closing ViewContact modal
    setOpen(false)
    setContact(null)
  }

  const groupContacts = useCallback(
    (contacts) => {
      const data = contacts.reduce((result, item) => {
        // Group by province
        if (!result[item.province]) {
          result[item.province] = {}
        }

        // Group by municipality within each province
        if (!result[item.province][item.municipality]) {
          result[item.province][item.municipality] = []
        }

        // Add the item to the corresponding municipality group
        result[item.province][item.municipality].push(item)

        return result
      }, {})

      setGroupContacts(data)
    },
    [setGroupContacts],
  )

  // Got this flowFilter from: https://stackoverflow.com/a/38762060/9352807
  // function flowFilter(array, substr) {
  //   return _.filter(
  //     array,
  //     _.flow(
  //       _.identity,
  //       _.values,
  //       _.join,
  //       _.toLower,
  //       _.partialRight(_.includes, substr),
  //     ),
  //   )
  // }

  // const handleSearch = (event) => {
  //   const searchKeyword = event.target.value

  //   /**
  //    * This globalSearchKeyword is just acting as a flag for the
  //    * 'secondary' prop of ListItemText
  //    */
  //   setGlobalSearchKeyword(searchKeyword)

  //   /**
  //    * This is for when the user types in the search bar a number (but actually
  //    * is a string), the secondary text will be shown indicating the cell
  //    * number of the contact. But if the user only types in the search
  //    * bar a string, only the filtered names will be shown.
  //    *
  //    */
  //   const isNaNSearchKeyword = isNaN(searchKeyword)

  //   setIsSearchKeywordNaN(isNaNSearchKeyword)

  //   if (event.target.value === '') setContacts(originalContacts)
  //   else {
  //     const filteredContacts = flowFilter(contacts, searchKeyword)
  //     setContacts(filteredContacts)
  //   }
  // }

  const handleCloseAddContact = () => {
    // This for closing the AddContact modal
    setAddContactOpen(false)
  }

  return (
    <div>
      {openSnackbar && Object.entries(snackbarDetails).length > 0 && (
        <SimpleSnackbar
          openSnackbar={true}
          message={snackbarDetails.message}
          severity={snackbarDetails.severity}
        />
      )}
      <>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddContact}
        >
          ADD CONTACT
        </Button>
        <AddContact
          contacts={originalContacts}
          open={addContactOpen}
          handleClose={handleCloseAddContact}
          handleAddContact={handleAddContact}
          loadingButton={loadingButton}
          regions={regions}
          province={province}
          setProvince={setProvince}
          municipality={municipality}
          setMunicipality={setMunicipality}
        />
      </>
      <br />
      <br />
      <div style={{ width: '30vw' }}>
        {loading ? (
          'Updating List...'
        ) : (
          <div>
            {/* <Box sx={styles.searchPhonebookTextField}>
              <TextField
                id="outlined-basic"
                label="Search..."
                onChange={handleSearch}
                variant="outlined"
                size="small"
                style={{ width: '100%' }}
              />
            </Box> */}

            {/* <List>
              {contacts?.length > 0 ? (
                contacts.map((contact) => {
                  const labelId = `checkbox-list-label-${contact.cellnumber}`

                  return (
                    <ListItem key={contact.cellnumber} disablePadding>
                      <ListItemButton
                        role={undefined}
                        dense
                        onClick={() => handleClick(contact)}
                      >
                        <ListItemText
                          id={labelId}
                          primary={
                            contact.name === ''
                              ? contact.cellnumber
                              : contact.name
                          }
                          secondary={
                            // globalSearchKeyword !== '' &&
                            // !isSearchKeywordNaN &&
                            contact.name !== '' && contact.cellnumber
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  )
                })
              ) : (
                <Container>
                  <p>No Results</p>
                </Container>
              )}
            </List> */}
            <div>
              {groupedContacts &&
                Object.keys(groupedContacts)
                  .sort()
                  .map((province, index) => {
                    return (
                      <Accordion key={index}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel1-content"
                          id="panel1-header"
                        >
                          <strong>{province}</strong>
                        </AccordionSummary>
                        <AccordionDetails>
                          {Object.keys(groupedContacts[province])
                            .sort()
                            .map((municipality) => {
                              return (
                                <div key={municipality}>
                                  <i>{municipality}</i>
                                  {groupedContacts[province][municipality].map(
                                    (contact) => {
                                      return (
                                        <ul key={contact.cellnumber}>
                                          <li
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleClick(contact)}
                                          >
                                            {contact.name} ({contact.nickname})
                                          </li>
                                        </ul>
                                      )
                                    },
                                  )}
                                </div>
                              )
                            })}
                        </AccordionDetails>
                      </Accordion>
                    )
                  })}
            </div>

            {contact && (
              <ViewContact
                contact={contact}
                contacts={contacts}
                handleClose={handleClose}
                handleDeleteContact={handleDeleteContact}
                handleEditContact={handleEditContact}
                loadingButton={loadingButton}
                open={open}
                regions={regions}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Phonebook
