## server

NodeJS backend for handling Firestore and Firebase Storage write operations using firebase-admin SDK and CRUD API endpoints.

## Requirements

1. Windows 10, MacOS, Linux
2. NodeJS LTS v16.14.2
3. Firebase Project [[link]](https://firebase.google.com/)
   - Pricing Plan: Spark plan or higher
   - with the **Email/Password** Provider enabled in the Firebase Console's
**Authentication** -> **Sign-in method** -> **Sign-in providers** options.
   - Service account credentials JSON file

### Core Libraries and Frameworks

1. [firebase-admin](https://www.npmjs.com/package/firebase-admin) v10.0.2
2. [Firebase Authentication](https://firebase.google.com/docs/auth) (using Email/Password Provider)
3. React 18 (CRA) on client app

## Installation

1. Install dependencies.
`npm install`
2. Set up the environment variables. Create a `.env` file inside the **/server** directory with reference to the `.env.example` file. Encode your own Firebase project settings on the following variables:

   | Variable Name               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
   | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | FIREBASE_SERVICE_ACC        | The project's private key file contents, condensed into one line and minus all whitespace characters.<br><br>The service account JSON file is generated from the Firebase project's **Project Settings** page, on **Project Settings** -> **Service accounts** -> **Generate new private key**                                                                                                                                                                                                                    |
   | FIREBASE_PRIVATE_KEY        | The `private_key` entry from the service account JSON file.<br> <blockquote>**NOTE:** Take note to make sure that the value starts and ends with a double-quote on WINDOWS OS localhost. Some systems may or may not require the double-quotes (i.e., Ubuntu).</blockquote>                                                                                                                                                                                                                                       |
   | ALLOWED_ORIGINS             | IP/domain origins in comma-separated values that are allowed to access the API.<br>Include `http://localhost:3000` by default to allow CORS access to the `/client` app.                                                                                                                                                                                                                                                                                                                                          |
   | ALLOW_CORS                  | Allows Cross Origin Requests (CORS) for client websites running on another domain to access the backend API, which is running on a different domain.<br>Default value is `1`. Setting to `0` will block AJAX API requests from client websites hosted on other domains, but will allow requests from Postman and other testing tools.                                                                                                                                                                             |
   | SORT_ALPHABETICAL           | Arranges the municipality names in alphabetical order.<br>Default value is `1`. Set to `0` to use the ordering as read from the Excel file.                                                                                                                                                                                                                                                                                                                                                                       |
   | AXIOS_SSL_REJECT_INVALID    | Flag to ignore SSL/TLS certificate verification errors and accept self-signed or invalid certificates in the `AxiosInstance` object axios settings, used for web scraping PAGASA's severe tropical cyclone and El Nino / La Nina weather forecast pages. Defaults to `'1'` (recommended for security). Set to `'0'` as an extreme workaround to ignore SSL/TLS certificate verification errors.                                                                                                                   |
   | ARCHIVE_TENDAY_FORECAST     | Flag to store (archive) the current 10-day weather forecast data during the `"npm run cron:tenday"` process for ACAP-RCMAS historical data.<br>Default value is `1`. Setting to `0` will skip the archiving process.                                                                                                                                                                                                                                                                                              |
   | DEPLOYMENT_PLATFORM         | This variable refers to the backend server's hosting platform, defaulting to<br>`DEPLOYMENT_PLATFORM=default` for full-server NodeJS express apps.<br>Valid values are:<br><br>`default` - (or undefined) for traditional full-server NodeJS express apps<br>`vercel` - for Vercel (serverless)                                                                                                                                                                                                                   |
   | EMAIL_WHITELIST             | Comma-separated email addresses linked to Firebase Auth UserRecords that are not allowed to be deleted or updated (write-protected)                                                                                                                                                                                                                                                                                                                                                                               |
   | LIVE_ORIGIN                 | Root domain where the client website is running from. This is used to allow sending PDF previews to the client website.                                                                                                                                                                                                                                                                                                                                                                                           |
   | PAGASA_10DAY_EXCEL_BASE_URL | Download URL of PAGASA's 10-day weather forecast excel files, minus the excel file names.<br>Default value is `https://pubfiles.pagasa.dost.gov.ph/pagasaweb/files/climate/tendayweatheroutlook`                                                                                                                                                                                                                                                                                                                  |
   | SEMAPHORE_API_KEY           | Semaphore API key from https://semaphore.co/. We use Semaphore for sending SMS messages.                                                                                                                                                                                                                                                                                                                                                                                                                          |
   | ACAP_API_KEYS               | Hard-coded list of comma-separated strings to use as API keys for granti access to shared REST API endpoints.                                                                                                                                                                                                                                                                                                                                                                                                     |
   | OPENWEATHERMAP_APPID        | (Optional) Openweathermap API ID from https://openweathermap.org/<br>We use the Openweathermap API to serve daily weather forecast data on the Home page<br><br><blockquote> ACAP stopped using the Openweather API since [v8.4.6](https://github.com/ciatph/climate-services-webportal/releases/tag/v8.4.6) but let's keep this variable for reference if there will be a need to use non-PAGASA weather data in the future.<br>We can use real or random values for this variable in the meantime.</blockquote> |
   | REGION_NAME                 | Region name. Default value is `"bicol"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
   | PROVINCES                   | Comma-separated province names belonging to `REGION_NAME`.<br>These should match the province names in the 10-day weather forecast excel files.                                                                                                                                                                                                                                                                                                                                                                   |
   | PROVINCES_ARCHIVE           | Comma-separated province names belonging to `REGION_NAME` whose 10-day weather forecast data should be included in the archives when running the NPM `cron:tenday` script.                                                                                                                                                                                                                                                                                                                                        |
   | DEFAULT_PROVINCE            | First province from the list of alphabetically-arranged `PROVINCES`. Default value is `"Albay"`                                                                                                                                                                                                                                                                                                                                                                                                                   |
   | CHECK_RANGE_YEAR | Enables strict current year validation on the PAGASA 10-Day Weather Forecast Excel files if `CHECK_RANGE_YEAR=1`.<br>Set its value to `CHECK_RANGE_YEAR=0` when running the seeder script `"npm run seed:all"` to disable strict year validation of the old 10-day weather forecast Excel files.<br>Set it's value back to `CHECK_RANGE_YEAR=1` when running the server. |
   | IS_RMCAS_API_ACTIVE | Flag that enables or disables the ACAP-RCMAS API group. Default value is `0`.<br>Valid values are:<br><br>`0` or `undefined` (do not include this variable in the .env file): Makes the ACAP-RCMAS APIs unreachable<br>`1`: Makes the ACAP-RCMAS APIs accessbile for online use |
   | ROOT_API_URL | Base URL of the backend's (server) REST API. This is the domain/origin where the backend is running minus the /api path segment.<br>Use [https://\<backend-server-name\>.onrender.com](https://\<backend-server-name\>.onrender.com). |
   | BASE_API_URL_VERCEL | Base URL of the backend (server) REST API deployed to Vercel, if deployment or CI/CD to Vercel is set up.<br>Exclude this from the .env file if `DEPLOYMENT_PLATFORM=default`.<br>Use [https://\<backend-server-name\>.vercel.app](https://\<backend-server-name\>.vercel.app). |
   | SPECIAL_CHARACTERS | Key-value pairs of special characters or garbled text and their normalized text conversions, delimited by the `":"` character.<br>Multiple key-value pairs are delimited by the `","` character.<br>If a special character key's value is a an empty string, write it as i.e.,: `"some-garbled-text:"` |

## Usage

1. Navigate to the `/server` directory.
2. Seed the Firestore database with default, minimal data to work on, if it's not yet seeded.
   - `npm run seed:all`
   - Read on the [Data Seeder Scripts](#data-seeder-scripts) section to run scripts for seeding specific data sets.
3. Generate the API documentation.
`npm run gen:docs`
4. Run the app:
   - (development mode) `npm run dev`
   - (production mode) `npm start`
5. Read the API documentation and usage examples guide of available CRUD API endpoints on:
`http://localhost:3001/docs`
6. Log-in to the `/client` app's superadmin pages on `http://localhost:3001/superadmin` using the default superadmin seeded user created on step no. 2:
   ```
   username: superadmin@gmail.com
   password: 123456789
   ```
6. Use the CRUD API endpoints to create/update/delete or view Firebase Auth users using Postman, curl, or other http clients.
   - Try signing in these users to the `/client` app.
   - > **NOTE:** Comment out the `cors` options line `app.use(cors(corsOptions))` on **/server/src/index.js** when testing on Postman and other http clients other than the `/client` app.

# Available Scripts - server

## Main Scripts

The npm scripts listed below are available under the **/server** directory.

### `npm start`

Run the express app (API only) in production mode. You'll need to `npm run gen:docs` if you haven't done so already, if you'd also like to view the API documentation usage in production mode.

### `npm run dev`

Run the express app (API only) in development mode.

### `npm run gen:docs`

Builds the API documentation. The static website documentation files are put in the `/src/public/docs` directory, and made available on `http://localhost:3001/docs`.

### `npm run lint`

Check source codes for lint errors.

### `npm run lint:fix`

Fix lint errors.

## Data Seeder Scripts

> **NOTE:** The data seeder npm scripts requires a proper set-up of the server's `.env` variables. Running the data seeder seeds ACAP's Firestore database with default, mock values, overwriting existing data.

### `npm run seed:all`

Runs all the data seeder scripts. Seeds ACAP's Firestore database with default, mock values.

### `npm run seed:00_superadmin`

Creates an initial **superadmin** Firebase Authentication user with the credentials:

```
email: superadmin@gmail.com
displayname: Super Admin
password: 123456789
account_level: 1
```

### `npm run seed:01_amiavillages`

Uploads the AMIA Villages data from a CSV file to a designated Firestore document.

> **NOTE:** This data should contain the attributes defined on the AMIA villages GeoJSON file hosted on MapBox.<br>
> Check out the `src/scripts/data/geojson/acap-bicol.geojson` file for reference.

### `npm run seed:02_forecast_seasonal`

> **NOTE:** The target excel file for upload should follow the excel format and structure on `/src/scripts/data/pagasa_seasonal_v2.xlsx`.

- Creates a minimal, empty seasonal weather forecast firestore collection with default values.
- The updated seasonal forecast weather can be uploaded on ACAP's `POST /api/weather/seasonal/excel`.
- The target excel can also be uploaded by running `npm run excelparse`

### `npm run seed:03_forecast_10day`

> **NOTE:** The target excel files for upload should follow the excel format and structure of the `day1.xlsx, day2.xlsx,... day10.xlsx` on the `/src/scripts/data/pagasa_10_day_excel` directory.<br>
> This script is sensitive to the excel files formatting and structure, and should be adjusted accordingly if PAGASA's excel files should change in the future.

- Uploads a set of static 10-day weather forecast data from PAGASA's 10-day weather excel files downloaded on January 13, 2023, to serve as a default 10-day weather forecast data until the automatic updater (`npm run cron:tenday`) can be set up.
- Running this script also creates the global provinces and municipalities list with naming convention similar those found in the latest downloaded excel files.

### `npm run seed:04_forecast_special`

Uploads an empty tropical cyclone (special) weather forecast data to serve as the default special weather forecast data until the automatic updater (`npm run cron:cyclone`) can be set up.

### `npm run seed:05_weather_systems`

Create default values for the common regional **SEASONAL** weather forecast - miscellaneous systems that may affect the weather data.

### `npm run seed:06_number_cyclones`

Create default values for the common regional **SEASONAL** weather forecast - number of tropical cyclones data.

### `npm run seed:07_moon_phases`

Create default values for the common regional **10-DAY** weather forecast - moon phases data.

### `npm run seed:08_windspeed`

Create default values for the common regional **SPECIAL** weather forecast - wind speed data.

### `npm run seed:09_elnino_monitoring`

Create default values for the El Nino/La Nina Monitoring data until the automatic updater (`npm run cron:typhoon`) can be set up.

### `npm run seed:10_search_keywords`

This script uploads a static copy of the search key words per public web page, which are originally the loaded and scraped text content of the live (dev or production) client website pages using puppeteer.<br>
The scraped text content is uploaded to Firestore on FIRESTORE_COLLECTIONS.PAGE_SEARCH for reference on static full text search on the upper menu's search bar.<br>
This script will upload default search keywords until the automatic updater (`npm run build:page_index`) can be set up.

### `npm run seed:11_assets`

Uploads data references of the accessible download URLs and other descriptive information about the various hi-resolution media assets (mostly image files) used by ACAP.<br>
Edit the contents of `/src/scripts/data/assets_dev.csv` accordingly before running this script.

### `npm run seed:12_cropping_calendar`

- Parses, normalizes and uploads the cropping calendar data along with the masterlist of provinces and municipalities data to Firestore.
- This script uses mock cropping calendar data for demonstration purposes.
- Follow the cropping calendar data format in `/src/scripts/data/cropping_calendar_v2.csv` for reference when seeding or uploading new data.

### `npm run seed:13_recommendations --mock`

- Parses, cleans, and normalize the crop recommendations excel file containing crop recommendations data for seasonal, 10-day and special weather categories
- This script uses mock crop recommendations data, containing random-generated content by default for demonstration purposes. It also has an option to use ACAP-Bicol's original and final crop recommendations.
- Follow the crop recommendations excel file format and structure in `/src/scripts/data/mock_recommendations_html_v2.xlsx` or `/src/scripts/data/recommendations_html_acap_bicol.xlsx` for reference when seeding or uploading new recommendations data.

#### Usage

- `npm run seed:13_recommendations --mock`
  - Use a random-generated mock crop recommendations data (default)
- `npm run seed:13_recommendations --mock=false`
  - Use ACAP-Bicol's original and final crop recommendations data

### `npm run seed:15_provinces`

- Uploads default, miscellaneous information (province codes and full name) for each of ACAP's supported provinces.
- See the `npm run upload:province_codes` NPM script usage description for setting custom province codes to Firestore.

### `npm run seed:reports --`

> **NOTE:** This script is for testing purposes only and is not run in the `npm run seed:all` script.<br>Admins should create reports for each month using the website UI.

- Automates mass creation of seasonal Reports, Bulletins and PDF files (max 6 from the latest seasonal months).
- Example usage (fill in the required parameters):<br>
`npm run seed:reports --region=bicol --province=Catanduanes --municipality=Baras --months=nov,dec,jan,feb,mar,apr --crop=Rice --language=tag`

## Data Uploader Scripts

These scripts upload data from local files to target Firestore targets.

### `npm run upload:calendar --localfilename=`

Uploads the contents of a cropping calendar CSV file and syncs it's municipality names with the latest 10-day weather forecast municipalities. The CSV file should placed inside the `/src/scripts/uploaders/cropping_calendar` directory. <br><br>
Sample usage:<br>
`npm run upload:calendar --localfilename=new_cropping_calendar.csv`

### `npm run upload:recommendations --localfilename=`

Parses and uploads the contents of a valid recommendations excel file located inside the /server/src/scripts/uploaders/recommendations directory.<br><br>
Sample usage:<br>
`npm run upload:recommendations --localfilename=ACAP-Bicol-Recommendations_ver4_html.xlsx`

### `npm run upload:province_codes`

Upload custom provinces information (code name, full province name) from `/src/scripts/uploaders/province_codes/data.json` file to the /constant_data/provinces_info document.<br>
Edit the `/src/scripts/uploaders/province_codes/data.json` file as needed before running this script.<br>
This script alters the default values set by running the `"npm run seed:15_provinces"` script.

## CRON Jobs

The CRON Jobs npm scripts run on a schedule using GitHub Action's scheduled workflows. These scripts can also be set up to run on any Ubuntu machine's `cron` job, or similar tools on other OS.<br>
Checkout the GitHub Actions YML files on `./github/workflows` for more information.

> **NOTE:** These scripts may need to be updated in the future, if the remote 3rd party files (mostly PAGASA's) that it's downloading and processing changes in structuring and format.

### `npm run cron:typhoon`

Scrape the latest Typhoon Advisory information from PAGASA's [El-Nino La-Nina Monitoring](https://www.pagasa.dost.gov.ph/climate/el-nino-la-nina/monitoring) website, and save its details on ACAP's internal typhoon advisory firestore collection.

### `npm run cron:tenday`

Download, parse and upload the latest 10-Day Weather Forecast data from PAGASA's website 10-Day Weather Forecast excel files to ACAP's Firestore database and create municipality names references in-sync with the latest cropping calendar data. This script runs on a scheduled GitHub actions workflow daily (once) between 9:00 am to 12:00 pm.

### `npm run cron:cyclone`

Scrape PAGASA's tropical cyclone bulletin web page and upload relevant contents to ACAP's Firestore database. This script runs on a scheduled GitHub actions workflow daily every 2 hours.

### `npm run build:page_index`

This script scrapes unique words for search keys from all of ACAP's public web pages, for use as search key-words on ACAP's search box feature. This script runs on GitHub actions after every deployment to the development or the production environment.

## CRON Jobs - Archived Data Cleanup Scripts

These NPM scripts delete outdated historical (archived) weather forecast data.

### `npm run cron:clean:tenday`

Delete archived (historical) 10-day weather forecast data that are older than (3) months.

### `npm run cron:clean:seasonal`

Delete archived (historical) seasonal weather forecast data that are older than (6) months.

### `npm run cron:clean:special`

Delete archived special weather (severe cyclone) forecast data that are older than (3) months.

## Miscellaneous

### `npm run build:documentidlist`

Inserts a `"list[]"` array field inside the archived 10-day, seasonal and special weather documents, containing an ID list of all respective archived documents.<br>
This list is used for tracking the deletion of excess historical archived documents, which will exceed the allotted quota.

This script should only be run once, if archived documents already exist, and the list[] array field does not yet exist.

### `npm run copyclient`

Copies the built `/client` website from `/client/build` to the server's root directory.

- It requires to build the client app first, after following its set-up [instructions](#client):
   ```
   cd client
   npm run build
   ```
- The built client app will be viewable on `http://localhost:3001` if the server is running.

### `npm run excelparse`

Loads and parses a local copy of PAGASA's latest shared seasonal weather forecast excel file for relevant data.

### `pagasa:municipalities`

Run the interactive [ph-municipalities](https://github.com/ciatph/ph-municipalities) NPM script for fetching the latest province and municipality names from PAGASA's 10-day weather forecast excel files.


### Notes

We should opt to deploy the backend on Cloud Functions for full-scale production deployments if the Blaze plan is available for the Firebase project rather than Heroku, so we will only work with one cloud infrastructure (Google/Firebase).

@ciatph
20220406
