import dayjs from 'dayjs'
import { useState, useEffect } from 'react'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import TextField from '@mui/material/TextField'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

function DatePickerRange ({ value=null, startDate, endDate, handleClick, disableCurrent, disabled = false }) {
  const [dateValue, setValue] = useState(null)
  let sDate = new Date(`${startDate}, ${new Date().getFullYear()}`)
  let eDate = new Date(`${endDate}, ${new Date().getFullYear()}`)

  // Start date falls on December and end date falls in January
  if (sDate.getMonth() + 1 === 12 && eDate.getMonth() + 1 === 1) {
    const nowDate = new Date()

    // Current month is January
    if (nowDate.getMonth() === eDate.getMonth()) {
      sDate = new Date(`${startDate}, ${nowDate.getFullYear() - 1}`)
    } else {
      eDate = new Date(`${endDate}, ${new Date().getFullYear() + 1}`)
    }
  }

  useEffect(() => {
    let val = value

    const getSelectedDate = () => {
      const nowDate = new Date()
      let targetDate = new Date(`${value.label}, ${nowDate.getFullYear()}`)

      // Start date falls on December and selected date falls in January
      if (nowDate.getMonth() + 1 === 12 && targetDate.getMonth() + 1 === 1) {
        targetDate = new Date(`${value.label}, ${new Date().getFullYear() + 1}`)
      }

      return targetDate
    }

    if (value !== null) {
      val = dayjs(getSelectedDate())
    }

    setValue(val)
  }, [value])


  const handleChange = (newValue) => {
    const value = dayjs(newValue).format('YYYY/MM/DD')

    if (value === 'Invalid Date') {
      return
    }

    if (dayjs(value).isBefore(dayjs(sDate)) || dayjs(value).isAfter(dayjs(eDate)) ) {
      return
    }

    if (handleClick) {
      handleClick(value)
    }
  }

  const disableCurrentDate = (date) => {
    return (disableCurrent) ?
      dayjs(date).format('YYYY/MM/DD') === dayjs().format('YYYY/MM/DD')
      : false
  }


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        disabled={disabled}
        minDate={dayjs(sDate)}
        maxDate={dayjs(eDate)}
        label="Date"
        value={dateValue}
        disablePast
        openTo='day'
        reduceAnimations
        shouldDisableDate={disableCurrentDate}
        onChange={(newValue) => handleChange(newValue)}
        renderInput={(params) => <TextField
          {...params}
          sx={{ marginTop: '8px', width: '100%',
          maxWidth: {
            xs: '100%',
            md: '300px'
          }}}
          onKeyDown={(e) => {
            e.preventDefault()
          }}
        />}
      />
    </LocalizationProvider>
  )
}

export default DatePickerRange
