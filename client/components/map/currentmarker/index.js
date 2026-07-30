import { useState, useEffect } from 'react'
import { Marker, Tooltip } from 'react-leaflet'
import mapstyles from '../Map.module.css'

function CurrentMapMarker ({ record }) {
  const [position, setPosition] = useState(null)
  const [item, setItem] = useState(null)
  const orderedKeys = ['Barangay', 'Municipality', 'Province', 'Association']

  useEffect(() => {
    if (record !== null) {
      setPosition([record.lat, record.lon])
    } else {
      setPosition(null)
    }

    setItem(record)
  }, [record])

  return position === null ? null :
    (
      <Marker position={position}
        eventHandlers={{
          mouseover: () => {
            setPosition(null)
          },
          click: () => {
            setPosition(null)
          }
        }}>
        <Tooltip className={mapstyles.tooltipCustom} permanent>
          <table style={{ width: '100%' }}>
            <tbody>
              {orderedKeys.map((info, idx) => (
                !['lat', 'lon'].includes(info)
                  ? <tr key={idx}>
                    <td><b>{info}:</b></td>
                    <td>{item[info.toLowerCase()]}</td>
                  </tr>
                  : <tr key={idx}></tr>
              ))}
            </tbody>
          </table>
        </Tooltip>
      </Marker>
    )
}

export default CurrentMapMarker
