import axios from 'axios'
import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProvinces } from '@/store/provinces/provinceThunks'
import {
  provinceReceived,
} from '@/store/provinces/provinceSlice'
import {
  municipalitiesReceived,
  municipalityReceived,
} from '@/store/municipalities/municipalitySlice'
import { fetchTendayWeather } from '@/store/weather/tenday/tendayThunks'
import { getTenDayProvince } from '@/services/weatherforecast_getter'

import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  GeoJSON,
  LayersControl,
} from 'react-leaflet'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import WeatherTodayContainer from '../home/weathertoday'
import CurrentMapMarker from './currentmarker'
import basemaps from './basemaps'
import styles from './styles'
import mapstyles from './Map.module.css'
import { REGION_LAT_AND_LNG } from '@/utils/constants'

const coordinates = REGION_LAT_AND_LNG.split(',')
const LAT = 0
const LNG = 1
const position = {
  lat: coordinates[LAT],
  lng: coordinates[LNG],
}

const orderedKeys = ['Barangay', 'Municipality', 'Province', 'Association']

// The 7 provinces this portal covers. Used to fetch a rainfall snapshot for
// each province on load so the map can be colored by rainfall severity.
const CENTRAL_LUZON_PROVINCES = [
  'Nueva Ecija',
  'Bulacan',
  'Aurora',
  'Zambales',
  'Tarlac',
  'Pampanga',
  'Bataan',
]

// Rainfall category -> severity level. These are the exact categories
// PAGASA's 10-day forecast excel reports (see server's tendayexcel parser) —
const RAINFALL_SEVERITY = {
  'NO RAIN': 0,
  'LIGHT RAINS': 1,
  'MODERATE RAINS': 2,
  'HEAVY RAINS': 3,
}

// Severity level -> fill color. Adjust these hex values to taste.
const SEVERITY_COLORS = [
  '#a5d6a7', // 0: No rain
  '#ffee58', // 1: Light rains
  '#ffa726', // 2: Moderate rains
  '#e53935', // 3: Heavy rains
]
const UNKNOWN_COLOR = '#cfd8dc' // no data yet / province not recognized

const SEVERITY_LABELS = ['No rain', 'Light rains', 'Moderate rains', 'Heavy rains']

function Map({ data = { villages: [], provincesMunicipalities: [] } }) {
  const [layer, setLayer] = useState({})
  const [municipality, setMunicipality] = useState('')
  const [currentLoc, setCurrentLoc] = useState(null)
  const [provinceRainfall, setProvinceRainfall] = useState({})
  const mapRef = useRef(null)
  const smallScreen = useMediaQuery((theme) => theme.breakpoints.down('md'))

  const {
    ids,
    entities: provinces,
    province: selectedProvince,
    municipalities: provinceMunicipalities,
  } = useSelector((state) => state.provinces)
  const {
    ids: municipalityIds,
    entities: municipalities,
    municipality: selectedMunicipality,
  } = useSelector((state) => state.municipalities)
  const mounted = useRef(null)
  const dispatch = useDispatch()

  useEffect(() => {
    if (mounted.current === null && ids.length === 0) {
      mounted.current = true
      dispatch(fetchProvinces())
    }
  }, [dispatch, ids.length])

  // Fetch today's rainfall category for every province once, on mount, so
  // the whole map can be colored by rainfall severity right away (this is
  // separate from the province filter's fetchTendayWeather, which only
  // loads full detail for the one currently-selected province).
  useEffect(() => {
    const loadRainfallSnapshot = async () => {
      const entries = await Promise.all(
        CENTRAL_LUZON_PROVINCES.map(async (provinceName) => {
          try {
            const response = await getTenDayProvince(provinceName)

            if (!response || response.length === 0) {
              return [provinceName, null]
            }

            const municipalityLists = Object.values(response[0].municipalities || {})

            if (municipalityLists.length === 0) {
              return [provinceName, null]
            }

            // Use the first municipality's first day (today) as the
            // province's representative rainfall category.
            const today = municipalityLists[0][0]
            return [provinceName, today?.rainfall ?? null]
          } catch (err) {
            console.error(`Failed to load rainfall for ${provinceName}:`, err.message)
            return [provinceName, null]
          }
        }),
      )

      setProvinceRainfall(Object.fromEntries(entries))
    }

    loadRainfallSnapshot()
  }, [])

  // Zoom (fly) to a Marker location
  const flyToLocation = (lat, lon) => {
    const map = mapRef.current

    if (!map) {
      return
    }

    map.flyTo([lat, lon + 4], 10, { duration: 2.5 })
  }

  useEffect(() => {
    const loadLayers = async () => {
      try {
        const geoJsonURL =
          process.env.NEXT_PUBLIC_GEOJSON_URL !== 'default'
            ? process.env.NEXT_PUBLIC_GEOJSON_URL
            : `https://api.mapbox.com/datasets/v1/${process.env.MAPBOX_USERNAME}/${process.env.MAPBOX_DATASET_ID}/features?access_token=${process.env.MAPBOX_API_KEY}`

        // Load and set the GeoJSON layer
        const response = await axios.get(geoJsonURL)
        setLayer(response.data)
      } catch (err) {
        console.error(err.message)
      }
    }

    loadLayers()
  }, [])

  // Look up a province's fill color based on today's rainfall severity
  const getRainfallColor = (provinceName) => {
    const rainfallCategory = provinceRainfall[provinceName]

    if (rainfallCategory === undefined || rainfallCategory === null) {
      return UNKNOWN_COLOR
    }

    const severity = RAINFALL_SEVERITY[rainfallCategory]
    return severity !== undefined ? SEVERITY_COLORS[severity] : UNKNOWN_COLOR
  }

  // Set the province associated with the selected municipality
  const selectMunicipalityHandler = (municipality, province) => {
    if (municipality === null && province === null) {
      setMunicipality('')
      setCurrentLoc(null)
    } else {
      const record = data.villages.find(
        (item) =>
          item.municipality === municipality && item.province === province,
      )

      if (record !== undefined) {
        const provinceName = record.province
        setMunicipality(provinceName)
        setCurrentLoc(record)
        flyToLocation(record.lat, record.lon)
      } else {
        setMunicipality('')
        setCurrentLoc(null)
      }
    }
  }

  const handleProvinceChange = async (event, newValue) => {
    if (!newValue) {
      dispatch(provinceReceived(null))
      dispatch(municipalitiesReceived([]))
      dispatch(municipalityReceived(null))
      setMunicipality('')
      setCurrentLoc(null)
      return
    }

    dispatch(provinceReceived(newValue))
    dispatch(municipalitiesReceived([]))
    dispatch(municipalityReceived(null))
    setMunicipality('')
    setCurrentLoc(null)
    dispatch(fetchTendayWeather(newValue.label))
  }

  const handleMunicipalityChange = (event, newValue) => {
    if (!newValue) {
      dispatch(municipalityReceived(null))
      setCurrentLoc(null)
      return
    }

    dispatch(
      municipalityReceived({
        id: newValue.id,
        label: newValue.label,
        iscalendar: newValue.iscalendar,
      }),
    )

    if (selectedProvince?.label) {
      selectMunicipalityHandler(newValue.label, selectedProvince.label)
    }
  }

  const handleMarkerClick = (item) => {
    const record = data.villages.find(
      (village) =>
        village.municipality === item.municipality &&
        village.province === item.province,
    )

    if (!record) {
      return
    }

    setCurrentLoc(record)
    setMunicipality(record.province)
    flyToLocation(record.lat, record.lon)

    const selectedProvince = Object.values(provinces).find(
      (province) => province.label === record.province,
    )

    if (selectedProvince) {
      dispatch(provinceReceived(selectedProvince))
      dispatch(municipalitiesReceived(provinceMunicipalities[selectedProvince.label] || []))
      dispatch(municipalityReceived(null))
      dispatch(fetchTendayWeather(selectedProvince.label))
    }
  }
console.log('provinceRainfall:', provinceRainfall)
  return (
    <Box
      sx={{ ...styles.map, position: 'relative' }}
      style={{ minHeight: smallScreen ? '1300px' : '600px' }}
    >
      <MapContainer
        style={{ height: '100%' }}
        center={position}
        zoom={8}
        maxZoom={12}
        minZoom={8}
        tileSize={512}
        placeholder={<h3>You need JavaScript to render this app.</h3>}
        whenCreated={(map) => {
          mapRef.current = map
        }}
      >
        {/** Basemaps */}
        <LayersControl position="topleft">
          {basemaps.map((map, index) => (
            <LayersControl.BaseLayer
              name={map.name}
              key={`map-${index}`}
              checked={index === 0}
            >
              <TileLayer
                zIndex={0}
                // accessToken={process.env.MAPBOX_API_KEY}
                // id={map.id}
                attribution={map.attribution}
                url={map.url}
              />
            </LayersControl.BaseLayer>
          ))}
        </LayersControl>

        {/** Set Region Provinces GeoJSON, colored by today's rainfall severity */}
        <GeoJSON
          key={`${Math.random().toString(36).substring(2, 8)}-${JSON.stringify(provinceRainfall)}`}
          municipality={municipality}
          data={layer.features}
          zIndex={1}
          onEachFeature={(feature, layer) => {
            // Get province name from properties
            const provinceName = feature.properties.adm2_en || ''
            console.log('Feature properties:', feature.properties)
            const fillColor = getRainfallColor(provinceName)

            layer.setStyle({
              fillColor:
                feature.properties.ADM2_EN === municipality
                  ? '#0000'
                  : fillColor,
              fillOpacity: 0.6,
              color: '#333333',
              weight: 1,
            })
          }}
        />


        {/** Point Markers */}
        {data.villages.map((item, index) => (
          <Marker
            position={[item.lat, item.lon]}
            key={index}
            id={`tooltip-${index}`}
            eventHandlers={{
              mouseover: () => {
                if (currentLoc !== null) {
                  setCurrentLoc(null)
                }
              },
              click: () => {
                handleMarkerClick(item)
              },
            }}
          >
            <Tooltip className={mapstyles.tooltipCustom} direction="left">
              <table style={{ width: '100%' }} id={`tip-${index}`}>
                <tbody>
                  {orderedKeys.map((info, idx) =>
                    !['lat', 'lon'].includes(info) ? (
                      <tr key={idx}>
                        <td>
                          <b>{info}:</b>
                        </td>
                        <td>{item[info.toLowerCase()]}</td>
                      </tr>
                    ) : (
                      <tr key={idx}></tr>
                    ),
                  )}
                </tbody>
              </table>
            </Tooltip>
          </Marker>
        ))}

        {/** Selected municipality's information label */}
        {!smallScreen && <CurrentMapMarker record={currentLoc} />}
      </MapContainer>

      <Box
        sx={{
          position: 'absolute',
          top: 150,
          left: 10,
          zIndex: 470,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: 2,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)',
          minWidth: '260px',
          maxWidth: '320px',
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
          Location Filters
        </Typography>
        <Autocomplete
          disablePortal
          id="province-filter"
          value={selectedProvince}
          slotProps={{
            popper: {
              sx: { zIndex: 9999 },
            },
        }}
          disabled={ids.length === 0}
          options={Object.values(provinces)}
          size="small"
          renderInput={(params) => (
            <TextField
              {...params}
              label={
                selectedProvince === null ? 'Select a province' : 'Province'
              }
            />
          )}
          isOptionEqualToValue={(option, value) =>
            option?.label === value?.label
          }
          onChange={handleProvinceChange}
        />
        <Box sx={{ mt: 1 }}>
          <Autocomplete
            disablePortal
            id="municipality-filter"
            value={selectedMunicipality}
            disabled={municipalityIds.length === 0 || !selectedProvince}
            options={Object.values(municipalities)}
            size="small"
            renderInput={(params) => (
              <TextField
                {...params}
                label={
                  selectedMunicipality === null
                    ? 'Select a municipality'
                    : 'Municipality'
                }
              />
            )}
            isOptionEqualToValue={(option, value) =>
              option?.label === value?.label
            }
            getOptionDisabled={(option) => option.iscalendar !== undefined}
            onChange={handleMunicipalityChange}
          />
        </Box>
      </Box>

      {/** Rainfall severity legend */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 150,
          left: 10,
          zIndex: 460,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: 1.5,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)',
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
          Legends
        </Typography>
        {SEVERITY_LABELS.map((label, idx) => (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '2px',
                backgroundColor: SEVERITY_COLORS[idx],
              }}
            />
            <Typography variant="caption" sx={{ fontSize: '11px' }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/** Weather Today Panel */}
      <WeatherTodayContainer
        record={currentLoc}
        isSmallScreen={smallScreen}
        onSelectMunicipality={selectMunicipalityHandler}
      />
    </Box>
  )
}

export default Map