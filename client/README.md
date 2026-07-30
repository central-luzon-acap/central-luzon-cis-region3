## climate-services-webportal

The Climate Services Web Portal will serve several climate web application services for agriculture accessible for public viewing and usage. The project aims  to empower farmers and decision-makers by giving them reliable crop activity advisories backed by organized crop recommendations research data.

The portal also aims to be a one-stop hub for consolidating and organizing expert-reviewed data that will be consumed by its web application services, and viewed by public viewers.


## Requirements

1. Windows, Linux or Mac OS
2. NodeJS LTS v16.14.2

### Core Libraries/Frameworks

(See package.json for more information)

1. NextJS 12.1.0
2. React 17.0.2
3. Material-UI v5

## Websites

- https://amia-cis.github.io/ (production)
- https://amia-cis-dev.web.app/ (development)


## Installation

### NextJS Setup

1. Clone this repository.
`git clone https://github.com/ciatph/climate-services-webportal.git`
2. Install dependencies.
`npm install`
3. Set up the environment variables. Create (3) new files: **.env**, **.env.development.local** and **.env.local** inside the `/client` directory with reference to the `.env.example` file. Provide the appropriate values for each variable as needed.

   | Variable Name                                | Description                                                                                                                                                             |
   | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | NEXT_PUBLIC_GEOJSON_URL                      | URL of the remote GeoJSON map layer containing municipalities boundaries used in the Home page<br>Loads the MapBox-hosted GeoJSON file if value is left to `"default"`. |
   | NEXT_PUBLIC_BASE_PATH                        | Assets and directory routing if the app is deployed to a non-root domain. Defaults to blank.                                                                            |
   | BASE_API_URL                                 | Base URL of the backend's (server) CRUD REST API                                                                                                                        |
   | BASE_URL                                     | Client app's base root URL                                                                                                                                              |
   | BASE_URL_PROD                                | Production client app's base root URL                                                                                                                                   |
   | PAGASA_EXCEL_FILE                        | Excel file name of PAGASA's sample seasonal weather forecast excel file                                                                                                    |
   | MAPBOX_USERNAME                              | Mapbox account username                                                                                                                                                 |
   | MAPBOX_BASEMAP_STYLE_ID                      | (Optional) - Mapbox style ID of a Style containing a blank map                                                                                                          |
   | MAPBOX_DATASET_ID                            | Mapbox dataset ID of a GeoJSON Dataset, containing the Bicol region's provinces GeoJSON file                                                                            |
   | MAPBOX_API_KEY                               | Mapbox API key to use for querying the Mapbox API                                                                                                                       |
   | REGION_NAME                                  | Region name. Default value is `"bicol"`                                                                                                                                 |
   | REGION_CODE                                  | Region code number                                                                                                                                                      |
   | REGION_LAT_AND_LNG                           | Center longitude (lon) and latitude (lat) of a region                                                                                                                   |
   | REGIONAL_FIELD_OFFICE                        | Regional field office name                                                                                                                                              |
   | REGION_URL                                   | Regional field office website URL                                                                                                                                       |
   | DEFAULT_PROVINCE                             | Default province name to use. Default value is `"Albay"`.                                                                                                               |
   | DEFAULT_MUNICIPALITY                         | One of the municipalities under `DEFAULT_PROVINCE`. Default value is `"Tiwi"`.                                                                                          |
   | NEXT_PUBLIC_FIREBASE_WEB_API_KEY             | Firebase web API key from the Firebase Project Settings configuration file.                                                                                             |
   | NEXT_PUBLIC_FIREBASE_WEB_AUTHDOMAIN          | Firebase web auth domain key from the Firebase Project Settings configuration file.                                                                                     |
   | NEXT_PUBLIC_FIREBASE_WEB_PROJECT_ID          | Firebase web project ID from the Firebase Project Settings configuration file.                                                                                          |
   | NEXT_PUBLIC_FIREBASE_WEB_STORAGE_BUCKET      | Firebase web storage bucket key from the Firebase Project Settings configuration file.                                                                                  |
   | NEXT_PUBLIC_FIREBASE_WEB_MESSAGING_SENDER_ID | Firebase web messaging sender ID from the Firebase Project Settings configuration file.                                                                                 |
   | NEXT_PUBLIC_FIREBASE_WEB_APP_ID              | Firebase web web app key from the Firebase Project Settings configuration file.                                                                                         |
   | NEXT_PUBLIC_FIREBASE_WEB_MEASUREMENT_ID      | Firebase web measurement ID from the Firebase Project Settings configuration file.                                                                                      |
   | NEXT_PUBLIC_CHECK_RANGE_YEAR               | Enables strict current year validation when generating a 10-day weather forecast bulletin preview in the Admin page if `NEXT_PUBLIC_CHECK_RANGE_YEAR=1`               |
   | CROPPING_CALENDAR_RICE_EXCEL_FILE | Cropping calendar "Rice" v2 Excel template file name |
   | CROPPING_CALENDAR_CORN_EXCEL_FILE | Cropping calendar "Corn" v2 Excel template file name |
   | RECOMMENDATIONS_RICE_EXCEL_FILE | Crop recommendations "Rice" v2 Excel template file name |
   | RECOMMENDATIONS_CORN_EXCEL_FILE | Crop recommendations "Corn" v2 Excel template file name |

4. Inspect the `/client/next.config.js` file and confirm each of the variables in step no. 3 is defined in it's `env: {}` section.
   - Update this file with new environment variables as needed by the `./client` app.
   - > **NOTE:** Environment variables starting in `NEXT_PUBLIC_` need not be included in the `/client/next.config.js` file's `env: {}` section.

### Firebase Security Rules Setup

Deploy the Firebase (Firestore and Storage) Security Rules to the specified Firebase project in the `.firebaserc` and `firebase.json` files. The following steps requires Firebase CLI login and access to Firebase project/s.

You may modify the `.firebaserc` and `firebase.json` files to define other Firebase apps and aliases.

1. Use the Firebase CLI to select a Firebase project. This branch uses the development Firebase app, **amia-cis-dev**.<br>
   - Run: `firebase use --add`
      - Run `firebase use <PROJECT_NAME>` if the Firebase project was selected before.
   - Select the **amia-cis-dev** Firebase project.
   - Type `dev` when prompted to provide an alias.

2. Deploy the Firestore Security Rules defined in the `firestore.rules` file using the Firebase CLI to the selected Firebase project.<br>
`firebase deploy --only firestore:rules`

1. Deploy the Firebase Storage Security Rules defined in the `storage.rules` file using the Firebase CLI.<br>
`firebase deploy --only storage:dev`

1. (Optional) Deploy the NextJS website app on the development Firebase Hosting using the Firebase CLI.<br>
`firebase deploy --only hosting:dev`

## Usage

1. Run the project in development mode.
`npm run dev`
2. Launch the development website from:
`http://localhost:3000`
3. Check for lint errors.
   - `npm run lint` (check lint errors)
   - `npm run lint:fix` (fix lint errors)
4. Export the static website.
   - `npm run export`


@ciatph
20220316
