import Typography from '@mui/material/Typography'

function Admin () {
  return (
    <div>
      <Typography variant='h4'><strong>Get Started</strong></Typography>
      <br />
      <p>
        ACAP’s Admin Pages consist of several admin-level tools for updating weather data, managing recommendations and crop calendars, generating agro-climatic bulletins, and sending text messages through Short Messaging Service (SMS).
      </p>

      <br />

      <Typography variant='h5'><u>ACAP Settings</u></Typography>
      <p style={{ marginTop: 0 }}>
        This page allows admins to manually update several parts of weather forecast information displayed on the public pages or data rendered on the PDF bulletins. Data updating is available through manual user input, excel file uploads, or by instructing the system to conduct instant PAGASA data syncing (done automatically at scheduled time intervals) with the press of a button.
      </p>

      <br />

      <Typography variant='h5'><u>Generate Bulletin</u></Typography>
      <p style={{ marginTop: 0 }}>
        This page allows admins to generate, preview, create and upload seasonal, 10-day, and special weather bulletins with weather forecast data referenced from each respective ACAP weather forecast data, cropping calendar, and pre-processed climate risk-based recommendations data by crop experts.
      </p>

      <br />

      <Typography variant='h5'><u>SMS Management</u></Typography>
      <p style={{ marginTop: 0 }}>
        This page allows admins to send a text message to their ACAP Phonebook contacts about a specific seasonal, 10-day, or special weather advisories.
      </p>

      <br />

      <Typography variant='h5'><u>Cropping Calendars</u></Typography>
      <p style={{ marginTop: 0 }}>
        This page allows admins to manage and update existing, and upload new cropping calendars using a pre-determined template in Excel format.
      </p>

      <br />

      <Typography variant='h5'><u>Manage Recommendations</u></Typography>
      <p style={{ marginTop: 0 }}>
        This page allows admins to manage and update existing, and upload new climate risk-based recommendations (both for PDF generation and SMS) for seasonal, 10-day, and special weather bulletins using a pre-determined template in Excel format.
      </p>

      <br />
      <br />

      <Typography variant='subtitle1'><strong>ACAP-Bicol Resources</strong></Typography>
      <ul>
        <li><strong>Project Technical Reports</strong></li>
        <li><strong>Admin User Manual</strong></li>
      </ul>
    </div>
  )
}

export default Admin
