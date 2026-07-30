import { useState, useMemo, useEffect } from 'react'
import { useSelector } from 'react-redux'

// Material UI
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

// Constants
import { ADAPTER_STATES } from '@/store/constants'
const selectAllOption = { id: 'municipalities', label: 'Select All...', all: true }

// Icons
import Checkbox from '@mui/material/Checkbox'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'

import styles from './styles'

function WindSignalForm ({
  item,
  signalNum = '',
  onItemChange
}) {
  const [isAllSelected, setIsAllSelected] = useState(false)

  const { ids: idsP, entities: optsprovinces, status: statProvinces } = useSelector((state) => state.provinces)
  const { ids: idsM, entities: optsmunicipalities, status: statMunicipalities } = useSelector((state) => state.municipalities)

  const municipalities = useMemo(() => {
    const items = [selectAllOption]
    return [...items, ...idsM.map(id => optsmunicipalities[id])]
  }, [optsmunicipalities, idsM])

  useEffect(() => {
    if (!isAllSelected) return
    if (!item.municipalities) return

    // Reset the select all check option
    const unselectableItems = municipalities.filter(item =>
      item.disabled || item.iscalendar !== undefined
    )?.length ?? 0

    if (
      isAllSelected &&
      item.municipalities.length !== idsM.length - unselectableItems
    ) {
      setIsAllSelected(false)
    }
  }, [item?.municipalities, municipalities, idsM, isAllSelected])

  const icon = <CheckBoxOutlineBlankIcon fontSize='small' />
  const checkedIcon = <CheckBoxIcon fontSize='small' />

  return (
    <Box sx={styles.container}>
      <Box className='windsignalrow'>
        {/** Wind Speed */}
        <Typography variant='h5' color='primary'>
          <strong>{`Wind Signal # ${signalNum}`}</strong>
        </Typography>

        <Typography variant='body2' sx={{ marginTop: '8px' }}>
          Select affected <strong>provinces</strong> and <strong>municipalities</strong>. Press the <strong>OK</strong> button to confirm your selection.
        </Typography>
      </Box>

      {/** Provinces */}
      <Box className='windsignalrow'>
        <Autocomplete
          disablePortal
          id='province'
          value={item[0]}
          disabled={
            idsP.length === 0 ||
            statProvinces === ADAPTER_STATES.PENDING ||
            statMunicipalities === ADAPTER_STATES.PENDING
          }
          options={idsP.map(id => optsprovinces[id])}
          renderInput={(params) =>
            <TextField
              {...params}
              variant='standard'
              label={idsP.length === 0
                ? 'Loading...'
                : 'Select a province'
              }/>
          }
          isOptionEqualToValue={(option, value) => option.label === value.label}
          onChange={(e, value) => {
            onItemChange({
              target: { id: 'province', value, signal: signalNum }
            })
          }}
        />
      </Box>

      {/** Municipalities */}
      <Box className='windsignalrow'>
        <Autocomplete
          multiple
          limitTags={4}
          disableCloseOnSelect
          id='municipalities'
          value={item.municipalities}
          options={municipalities}
          ListboxProps={{
            style: {
              maxHeight: '200px'
            }
          }}
          sx={{ '.inputRoot': {
            color: 'res'
          } }}
          disabled={
            item.province === null ||
            idsP.length === 0 ||
            idsM.length === 0 ||
            statProvinces === ADAPTER_STATES.PENDING ||
            statMunicipalities === ADAPTER_STATES.PENDING
          }
          renderInput={(params) =>
            <TextField
              {...params}
              variant='standard'
              label={idsP.length === 0
                ? 'Loading...'
                : 'Select municipalities'
              }/>
          }
          renderOption={(props, option, { selected }) => {
            if (selected && option.label !== selectAllOption.label) return

            const isDisable = option.label === selectAllOption.label
              ? isAllSelected
              : selected

            return <li {...props}>
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                style={{ marginRight: 8 }}
                checked={isDisable}
              />
              {option.label}
            </li>
          }}
          getOptionDisabled={(option) => (option.disabled || option.iscalendar !== undefined)}
          isOptionEqualToValue={(option, value) => option.label === value.label}
          onChange={(e, value) => {
            if (value.find(option => option.label === selectAllOption.label)) {
              // Select all municipalities
              setIsAllSelected(true)

              onItemChange({
                target: {
                  id: 'municipalities',
                  value: !isAllSelected
                    ? municipalities.filter(item =>
                      (!item.disabled && !item.iscalendar) &&
                      item.label !== selectAllOption.label
                    )
                    : [],
                  signal: signalNum
                }
              })
            } else {
              // Select a single municipality
              onItemChange({
                target: { id: 'municipalities', value, signal: signalNum }
              })
            }
          }}
        />
      </Box>
    </Box>
  )
}

export default WindSignalForm
