## climate-services-webportal - R6

> ACAP v2.0 for Region 6 - Bicol

The Agro-Climatic Advisory Portal (ACAP), a Climate Information Services web application (CIS) co-developed by the [University of the Philippines Los Banos Foundation, Inc.](https://uplbfi.org/) (UPLBFI) and the [Alliance of Bioversity International and CIAT](https://alliancebioversityciat.org/) (Alliance) with the [Department of Agriculture (DA)](https://www.da.gov.ph/) and the [Regional Field Office 5 (RFO 5)](https://bicol.da.gov.ph/) is a digital platform that serves as a centralized hub for the development of Climate Information Services (CIS) in the Bicol Region. It contains relevant weather and climate information to use with tailored advisories and crop recommendations.

The portal will serve several climate web application services for agriculture accessible for public viewing and usage, and it aims to empower farmers and decision-makers by giving them reliable crop activity advisories backed by organized crop recommendations research data.

The portal also aims to be a one-stop hub for consolidating and organizing expert-reviewed data to be consumed by its web application services and viewed by public viewers.

> [!IMPORTANT]
> This code repository, including all raw source codes, files, and documents otherwise stated, is a proprietary property of the **Department of Agriculture (DA)** and the **DA Regional Field Office 5**. As such, kindly protect confidentiality, ensuring shared copies of it obtained after gaining access to this parent repository remain _**private**_ in GitHub or any other public platform.


### ACAP Development Documentation

For additional information on guidelines for ACAP development and extension, please refer to the updated documentation available at:
- https://acaptutorials.github.io

### ACAP Cloud Components Overview

![acap components](/server/src/scripts/data/components-overview-v2-small.png)

### ACAP Data Sources

![acap datasources](/server/src/scripts/data/diagrams/acap_1.0_arch_datasources.png)

## Requirements

NodeJS LTS v16.14.2

## Content

- [climate-services-webportal](#climate-services-webportal)
  - [ACAP Cloud Components Overview](#acap-cloud-components-overview)
- [Requirements](#requirements)
- [Content](#content)
- [The ACAP-RCMAS APIs](#acap-rcmas-apis)
- [Installation](#installation)
- [Usage](#usage)
  - [Run the Client and Server Apps on Localhost](#run-the-client-and-server-apps-on-localhost)
  - [Run the Client and Server Apps Using Docker](#run-the-client-and-server-apps-using-docker)
- [Code Repository](#code-repository)
- [Backend Server URLs](#backend-server-urls)
- [Client Website URLs](#client-website-urls)
- [Github Actions Variables](#github-actions-variables-environment-variables)
- [Github Actions Secrets](#github-actions-secrets-environment-variables)
  - [Firebase](#firebase)
  - [GitHub Pages](#github-pages)
  - [Render (render.com)](#render-rendercom)
  - [Vercel](#vercel)
  - [Heroku](#heroku)
  - [MapBox](#mapbox)
  - [Openweather API](#openweather-api)
  - [Miscellaneous](#miscellaneous)
- [Render Secrets](#render-secrets)

## ACAP-RCMAS APIs

The ACAP-RCMAS APIs are a set of new server APIs for sharing ACAP's PAGASA-sourced weather forecast data, built on ACAP 1.0. You can read more information about this project in the **/docs/acap-rcmas-api** directory.

The ACAP-RCMAS APIs are still in their prototype stage and usage with IRRI's project and only apply to the Bicol region for now. It has possibilities of applying to other regions as well, should the Department of Agriculture (DA) go ahead with it, which is why we decided to integrate it as early as now for future use.

Until further notice, please disable it from running or being accessible by supplying the **"deactivated values"** of following environment variables and GitHub Secrets/Variables.

> The ACAP-RMCAS APIs work in sync with the base ACAP 1.0 and 2.0. ACAP developers should update related code to sync with specific customizations and updates if they need to activate and use the APIs.

### .env File

| Environment Variable (.env file) | Deactivated Value | Activated |
| --- | --- | --- |
| ARCHIVE_TENDAY_FORECAST | (exlude from .env file) | 1 |
| ACAP_API_KEYS | (exlude from .env file) | _\<Any random string\>_ |
| IS_RMCAS_API_ACTIVE | (exlude from .env file) | 1 |
| ROOT_API_URL_VERCEL | (exlude from .env file) | https://\<vercel-app-name\>.vercel.app |

### GitHub SECRETS

Exclude all GitHub Secrets under the **[Vercel](#vercel)** section plus:

| GitHub Secrets| Deactivated Value | Activated |
| --- | --- | --- |
| ARCHIVE_TENDAY_FORECAST | (exlude from GH Secrets) | 1 |
| ACAP_API_KEYS | (exlude from GH Secrets) | (exlude from GH Secrets) |
| IS_RMCAS_API_ACTIVE | (exlude from GH Secrets) | 1 |
| ROOT_API_URL_VERCEL_DEV | (exlude from GH Secrets) | https://\<vercel-app-dev\>.vercel.app |
| ROOT_API_URL_VERCEL_PROD | (exlude from GH Secrets) | https://\<vercel-app-prod\>.vercel.app |

### GitHub VARIABLES

Exclude all GitHub Variables under the **[Github Actions Variables](#github-actions-variables-environment-variables)** section plus:

| GitHub Variables| Deactivated Value | Activated |
| --- | --- | --- |
| DEPLOYMENT_PLATFORM | (exlude from GH Variables)<br>or `default` | `vercel` |
| IS_RMCAS_API_ACTIVE | (exlude from GH Variables) | 1 |

## Installation

1. Clone this repository.
`git clone https://github.com/ciatph/climate-services-webportal.git`

2. Install the **client** and **server** dependencies.
   - client
      ```
      cd climate-services-webportal/client
      npm install
      ```
   - server
      ```
      cd climate-services-webportal/server
      npm install
      ```

3. Set the **client** and **server** environment variables.
   - client
      - Create a **.env** file inside the `/client` directory
      - Copy the contents of `/client/.env.example` into the `.env` file created from the previous step.
      - Provide the appropriate values for each variable as needed.
   - server
      - Create (1) new file: **.env** inside the `/server` directory
      - Copy the contents of `/server/.env.example` into the new file created from the previous step.
      - Take note to supply the appropriate values for `FIREBASE_SERVICE_ACC` and `FIREBASE_PRIVATE_KEY`.
4. Read the instructions on the **README** files inside the `/server` and `/client` directories for detailed information on configuring and using the client and backend.

## Usage

Run the client and server apps on localhost after following the set-up steps in the [Installation](#installation) section, and the detailed **client** and **server** configuration steps.

### Run the Client and Server Apps on Localhost

1. Run the app for local development.
   - client
      ```
      cd climate-services-webportal/client
      npm run dev
      ```
   - server
      ```
      cd climate-services-webportal/server
      npm run dev
      ```
2. Launch the local website on:
`http://localhost:3000`

### Run the Client and Server Apps Using Docker

We can use Docker to run dockerized client and server apps for local development and production mode. The following methods require Docker and Docker compose correctly installed and set up on your development machine, and set-up of the required `.env` files in the **client** and **server** directories discussed in the Installation](#installation) section.

<b>Docker Dependencies</b>

The following dependencies are used to build and run the image. Please feel feel free to use other OS and versions as needed.

1. Ubuntu 22.04.1
2. Docker version 23.0.3, build 3e7cbfd

<b>Docker for Localhost Development</b>

1. Verify that ports 3000 and 3001 are free because the client and server containers will use these ports.
2. Stop current-running acap containers, if any.

   ```
   docker compose -f docker-compose.dev.yml down
   docker compose -f docker-compose.prod.yml up
   ```
3. Stop and delete all docker instances for a fresh start.
   - > **NOTE:** Running this script will delete all docker images, containers, volumes, and networks. Run this script if you feel like everything is piling but do not proceed if you have important work on other running Docker containers.
   - ```
     sudo chmod u+x scripts/docker-cleanup.sh
     ./scripts/docker-cleanup.sh
     # Answer all proceeding prompts
     ```
4. Edit any of the files under the `/client` or `/server` directory after running step no. 4.2 and wait for their live reload on `http://localhost:3000` (client) and `http://localhost:3001` (server).

   ```
   # 4.1. Build the client and server containers for localhost development.
   docker compose -f docker-compose.dev.yml build

   # 4.2. Create and start the development client and server containers
   docker compose -f docker-compose.dev.yml up

   # 4.3. Stop and remove the development containers, networks, images and volumes
   docker compose -f docker-compose.dev.yml down
   ```

<b>Docker for Production Deployment</b>

The following docker-compose commands build a small client image targeted for creating optimized dockerized apps running on self-managed production servers. An Nginx service serves the frontend client on port 3000. Hot reload is NOT available when editing source codes from the `/client` and `/server` directories.

1. Follow step numbers 1 - 4 in the Docker for Localhost Development section.
2. Build the client and server containers for production deployment.
   - > **NOTE:** Run this step only once or as needed when housekeeping docker images or if there are new source code updates in the /client or /server directories.
   - `docker compose -f docker-compose.prod.yml build`
3. Load the production mode apps on `http://localhost:3000` (client) and `http://localhost:3001` (server) after running step no. 3.1.

   ```
   # 3.1. Create and start the production client and server containers.
   docker compose -f docker-compose.prod.yml up

   # 3.2. Stop and remove the production containers, networks, images and volumes
   docker compose -f docker-compose.prod.yml down
   ```

## Code Repository

The **climate-services-webportal** repository is a monorepo that contains source codes for the front-end in the `/client` directory, and backend in the `/server` directory. Set-up and usage instructions are available in each respective directory.

## Backend Server URLs

- **Production**
  - Server: https://amia-cis-b2cy.onrender.com/api
  - API Documentation: https://amia-cis-b2cy.onrender.com/docs
  - Vercel: https://acap-rcmas.vercel.app
- **Development**
  - Server: https://amia-cis-d2cn.onrender.com/api
  - API Documentation: https://amia-cis-d2cn.onrender.com/docs
  - Vercel: https://acap-rcmas-dev.vercel.app
- **Localhost Development**:
  - Server: http://localhost:3001/api

## Client Website URLs

- Production (Live) Website: https://amia-cis.github.io/
- Development (Live) Website: https://amia-cis-dev.web.app/
- Localhost Development Website: http://localhost:3000

## GitHub Actions Variables (Environment Variables)

ACAP uses GitHub Variables to require some GitHub Actions jobs or steps to run. Most variables define the "optional" ACAP-RCMAS APIs clean-up functions and availability in GitHub Actions.

| Variable Name | Description |
| --- | --- |
| DEPLOYMENT_PLATFORM         | <blockquote>**NOTE**: `DEPLOYMENT_PLATFORM` is a GitHub **VARIABLE** not a GitHub Secret</blockquote><br>This variable refers to the backend server's hosting platform, defaulting to `DEPLOYMENT_PLATFORM=default` for full-server NodeJS express apps. Valid values are:<br><br>`default` - for traditional full-server NodeJS express apps (or undefined)<br>`vercel` - for Vercel (serverless)<br><br>*Will deploy the server to a configured Vercel app if `DEPLOYMENT_PLATFORM=vercel`.<br><br>**NOTE:** Server deployment to Vercel is optional since the (NodeJS) REST APIs are also accessible from the standard Render server.<br>Setup the server deployment to Vercel only if you want to take advantage of Vercel's faster cold starts than the (free) Render services:<br>_~20 secs. **(Vercel)** vs. 1 - 3 minutes **(Render)**_.<br><br>Read on the ACAP-RCMAS APIs software documentation in the **/docs/acap-rcmas-api** directory for more information about the APIs and its optional deployment to Vercel. |
| IS_RMCAS_API_ACTIVE | It determines whether to run the NPM scripts for cleaning "old" archived ACAP-RCMAS weather forecast data. For more information, read about its full definition under the **GitHub Actions Secrets - Miscellaneous** section. |

## Github Actions Secrets (Environment Variables)

The following GitHub secrets are required for GitHub Actions.

Refer to the **README** inside `/client` and `/server` for more informaation on their required environment variables.

### Firebase

| Variable Name                         | Description                                                                                                                                                                                                                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FIREBASE_TOKEN                        | Firebase CI token used for deploying the `/client` app to Firebase Hosting.<br>This is obtained by signing-in to the firebase cli.                                                                                                                                                                                        |
| FIREBASE_SERVICE_ACC_DEV              | The (Development) Firebase project's service account JSON contents, condensed into one line and minus all whitespace characters.<br><br>The service account JSON file is generated from the Firebase project's **Project Settings** page, on **Project Settings** -> **Service accounts** -> **Generate new private key** |
| FIREBASE_PRIVATE_KEY_DEV              | The (Development) `private_key` entry from the `FIREBASE_SERVICE_ACC_DEV` service account JSON file.<br><br><blockquote>**NOTE:** Take note to make sure that the value starts and ends with a double-quote on WINDOWS OS localhost. Some systems may or may not require the double-quotes (i.e., Ubuntu).</blockquote>   |
| FIREBASE_SERVICE_ACC_PROD             | The (Production) Firebase project's service account JSON contents, condensed into one line and minus all whitespace characters.<br><br>The service account JSON file is generated from the Firebase project's **Project Settings** page, on **Project Settings** -> **Service accounts** -> **Generate new private key**  |
| FIREBASE_PRIVATE_KEY_PROD             | The (Production) `private_key` entry from the `FIREBASE_SERVICE_ACC_PROD` service account JSON file.<br><br><blockquote>**NOTE:** Take note to make sure that the value starts and ends with a double-quote on WINDOWS OS localhost. Some systems may or may not require the double-quotes (i.e., Ubuntu).</blockquote>   |
| FIREBASE_WEB_API_KEY_DEV              | Firebase web API key from the (Development) Firebase Project Settings configuration file.                                                                                                                                                                                                                                 |
| FIREBASE_WEB_AUTHDOMAIN_DEV           | Firebase web auth domain key from the (Development) Firebase Project Settings configuration file.                                                                                                                                                                                                                         |
| FIREBASE_WEB_PROJECT_ID_DEV           | Firebase web project ID from the (Development) Firebase Project Settings configuration file.                                                                                                                                                                                                                              |
| FIREBASE_WEB_STORAGE_BUCKET_DEV       | Firebase web storage bucket key from the (Development) Firebase Project Settings configuration file.                                                                                                                                                                                                                      |
| FIREBASE_WEB_MESSAGING_SENDER_ID_DEV  | Firebase web messaging sender ID from the (Development) Firebase Project Settings configuration file.                                                                                                                                                                                                                     |
| FIREBASE_WEB_APP_ID_DEV               | Firebase web web app key from the (Development) Firebase Project Settings configuration file.                                                                                                                                                                                                                             |
| FIREBASE_WEB_MEASUREMENT_ID_DEV       | Firebase web measurement ID from the (Development) Firebase Project Settings configuration file.                                                                                                                                                                                                                          |
| FIREBASE_WEB_API_KEY_PROD             | Firebase web API key from the (Production) Firebase Project Settings configuration file.                                                                                                                                                                                                                                  |
| FIREBASE_WEB_AUTHDOMAIN_PROD          | Firebase web auth domain key from the (Production) Firebase Project Settings configuration file.                                                                                                                                                                                                                          |
| FIREBASE_WEB_PROJECT_ID_PROD          | Firebase web project ID from the (Production) Firebase Project Settings configuration file.                                                                                                                                                                                                                               |
| FIREBASE_WEB_STORAGE_BUCKET_PROD      | Firebase web storage bucket key from the (Production) Firebase Project Settings configuration file.                                                                                                                                                                                                                       |
| FIREBASE_WEB_MESSAGING_SENDER_ID_PROD | Firebase web messaging sender ID from the (Production) Firebase Project Settings configuration file.                                                                                                                                                                                                                      |
| FIREBASE_WEB_APP_ID_PROD              | Firebase web web app key from the (Production) Firebase Project Settings configuration file.                                                                                                                                                                                                                              |
| FIREBASE_WEB_MEASUREMENT_ID_PROD      | Firebase web measurement ID from the (Production) Firebase Project Settings configuration file.                                                                                                                                                                                                                           |

### GitHub Pages

ACAP uses another GitHub repository's GitHub Pages for deploying it's client website. The remote GitHub repository is public, and only contains ACAP's built `/client` app exported using `npm run export`.

| Variable Name | Description                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| GH_EMAIL      | Email associated with the target (remote) GitHub account on which Github Pages the production `/client` app is deployed. |
| GH_USERNAME   | GitHub username associated with `GH_EMAIL`                                                                               |
| GH_ORG        | GitHub organization name from the GitHub account (linked to `GH_EMAIL`)                                                  |
| GH_PUSH_TOKEN | GitHub Personal Access Token associated with `GH_EMAIL`                                                                  |
| GH_REPOSITORY | Public GitHub repository name on GH_ORG on which Github Pages the production `/client app` is deployed.                  |

### Render (render.com)

| Variable Name           | Description                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| RENDER_DEPLOY_HOOK_DEV  | The (development) server's private Deploy Hook URL to trigger a deploy for it's server on render.com |
| RENDER_DEPLOY_HOOK_PROD | The (production) server's private Deploy Hook URL to trigger a deploy for it's server on render.com  |
| API_BASE_URL_DEV        | /server app's API base url on the Render (development) app<br>https://amia-cis-xj2o.onrender.com/api |
| API_BASE_URL_PROD       | /server app's API base url on the Render (production) app<br>https://amia-cis.onrender.com/api       |

### Vercel

ACAP's prototype RCMAS APIs (ACAP-RCMAS API) uses a server hosted on a standard account Vercel app to achieve faster response times when calling the REST API endpoints than the standard (free-tier) Render apps. Standard **Render** apps have a `1 - 2 minute` cold start, while standard **Vercel** apps only have a `20 - 30 seconds` cold start.

> Deployment to Vercel is optional. Devs may choose to continue using only Render. Feel free to use and explore other standard and paid infrastructures that can host the NodeJS apps (server), such as AWS, Digital Ocean, GCP, Microsft Azure, FlyIO, and others not mentioned.

Since Vercel cannot run the scripts that generate the bulletin PDFs, ACAP deploys its server to both the standard Vercel and Render apps. The ACAP-RCMAS APIs are accessible in Vercel and Render. Of the two options, accessing the ACAP-RCMAS APIs is more convenient on Vercel since it has faster API response times. This setup may change sooner after achieving fast API response times with Render or other environments.

| Variable Name          | Description                                                         |
| ---------------------- | ------------------------------------------------------------------- |
| VERCEL_ORG_ID          | Vercel organization ID (Vercel account ID, useable on all projects) |
| VERCEL_PROJECT_ID_PROD | Vercel (production) project ID                                      |
| VERCEL_PROJECT_ID_DEV  | Vercel (development) project ID                                     |
| VERCEL_TOKEN           | Vercel account token to use for deployment                          |
| VERCEL_APP_DEV         | Vercel (development) app/project name                               |
| VERCEL_APP_PROD        | Vercel (production) app/project name                                |
| ROOT_API_URL_VERCEL_DEV,<br>ROOT_API_URL_VERCEL_PROD | Base URL of the Vercel backend (server) REST API deployed to Vercel, if deployment or CI/CD to Vercel is set up.<br>Exclude this from the GitHub Secrets if `DEPLOYMENT_PLATFORM=default`.<br>Use the base URL format (for dev and prod deployments): [https://\<backend-server\>.vercel.app](https://\<backend-server-prod\>.vercel.app). |

### Heroku

ACAP's server initially used Heroku for hosting and migrated to Render as of [v8.1.1](https://github.com/ciatph/climate-services-webportal/releases/tag/v8.1.1), after Heroku shut down it's Free plan.<br><br>
Use the following Heroku environment variables for reference to deploy on Heroku's new paid plans.<br>
Check out the archived Heroku yml files on `.github/workflows/archive` for reference.

| Variable Name     | Description                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| HEROKU_EMAIL      | Heroku email of a Heroku account on which to deploy the **/server**                                                     |
| HEROKU_API_KEY    | Heroku account API key associated with `HEROKU_EMAIL`                                                                   |
| HEROKU_APP_DEV    | Heroku (development) app name inside a Heroku account associated with `HEROKU_EMAIL` on which to deploy the **/server** |
| HEROKU_APP_PROD   | Heroku (production) app name inside a Heroku account associated with `HEROKU_EMAIL` on which to deploy the **/server**  |
| API_BASE_URL_DEV  | /server app's API base url on the Heroku (development) app<br>https://amia-cis.herokuapp.com/api                        |
| API_BASE_URL_PROD | /server app's API base url on the Heroku (production) app<br>https://amia-cis-dev.herokuapp.com/api                     |

### MapBox

ACAP uses MapBox to host the AMIA Villages GeoJSON file used on the Home Page's map visualization.

| Variable Name           | Description                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| MAPBOX_USERNAME         | Mapbox username                                                                              |
| MAPBOX_BASEMAP_STYLE_ID | Mapbox style ID of a Style containing a blank map                                            |
| MAPBOX_DATASET_ID       | Mapbox dataset ID of a GeoJSON Dataset, containing the Bicol region's provinces GeoJSON file |
| MAPBOX_API_KEY          | Mapbox API key to use for querying the Mapbox API                                            |

### Openweather API

| Variable Name        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OPENWEATHERMAP_APPID | (Optional) Openweather API key, required to query the Openweather API.<br><br><blockquote>**NOTE:** ACAP stopped using the Openweather API since [v8.4.6](https://github.com/ciatph/climate-services-webportal/releases/tag/v8.4.6) but let's keep this variable for reference if there will be a need<br>to use non-PAGASA weather data in the future. We can use real or random values for this variable in the meantime.</blockquote> |

### Miscellaneous

| Variable Name               | Description                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FIREBASE_APP_DEV            | Name of the development Firebase project                                                                                                                                                                                                                                                                                                                                                        |
| EMAIL_WHITELIST             | Comma-separated emails of ACAP's Firebase Auth users that are not allowed to be updated.                                                                                                                                                                                                                                                                                                        |
| LIVE_ORIGIN_DEV             | The (development) domain/origin where the client is running, which will be used by the server's `LIVE_ORIGIN` variable.<br>Use https://climate-webservices-dev.web.app                                                                                                                                                                                                                          |
| LIVE_ORIGIN_PROD            | The (production) domain/origin where the client is running, which will be used by the server's `LIVE_ORIGIN` variable.<br>Use https://amia-cis.github.io.                                                                                                                                                                                                                                       |
| REGION_NAME                 | Region name. Default value is `"bicol"`                                                                                                                                                                                                                                                                                                                                                         |
| PROVINCES                   | Comma-separated province names belonging to `REGION_NAME`.<br>These should match the province names found in the 10-day weather forecast excel files.                                                                                                                                                                                                                                           |
| PROVINCES_ARCHIVE           | Comma-separated province names belonging to `REGION_NAME` whose 10-day weather forecast data should be included in the archives when running the NPM `cron:tenday` script.                                                                                                                                                                                                                      |
| DEFAULT_PROVINCE            | Default province name to use. Default value is `"Albay"`.                                                                                                                                                                                                                                                                                                                                       |
| DEFAULT_MUNICIPALITY        | One of the municipalities under `DEFAULT_PROVINCE`. Default value is `"Tiwi"`.                                                                                                                                                                                                                                                                                                                  |
| SORT_ALPHABETICAL           | Arranges the municipality names in alphabetical order.<br>Default value is `1`. Set to `0` to use the ordering as read from the Excel file.                                                                                                                                                                                                                                                     |
| AXIOS_SSL_REJECT_INVALID    | Flag to ignore SSL/TLS certificate verification errors and accept self-signed or invalid certificates in the `AxiosInstance` object axios settings, used for web scraping PAGASA's severe tropical cyclone and El Nino / La Nina weather forecast pages. Defaults to `'1'` (recommended for security). Set to `'0'` as an extreme workaround to ignore SSL/TLS certificate verification errors. |
| ARCHIVE_TENDAY_FORECAST     | Flag to store (archive) the current 10-day weather forecast data during the<br>`"npm run cron:tenday"` process for ACAP-RCMAS historical data.<br>Default value is `1`. Setting to `0` will skip the archiving process.                                                                                                                                                                            |
| PAGASA_10DAY_EXCEL_BASE_URL | Download URL of PAGASA's 10-day weather forecast excel files, minus the excel file names.<br>`https://pubfiles.pagasa.dost.gov.ph/pagasaweb/files/climate/tendayweatheroutlook`                                                                                                                                                                                                                 |
| PAGASA_EXCEL_FILE | Excel file name of PAGASA's Seasonal Weather Forecast Excel file for **Nov 2022 - Apr 2023** (shared thru email)<br> to use as a seasonal weather forecast Excel template reference. |
| NEXT_PUBLIC_GEOJSON_URL     | URL of the remote GeoJSON map layer containing municipalities boundaries used in the Home page<br>Loads the MapBox-hosted GeoJSON file if value is left to `"default"`.                                                                                                                                                                                                                         |
| NEXT_PUBLIC_CHECK_RANGE_YEAR_DEV | Enables strict current year validation when generating a 10-day weather forecast bulletin preview in the (development) Admin page if `NEXT_PUBLIC_CHECK_RANGE_YEAR_DEV=1` |
| NEXT_PUBLIC_CHECK_RANGE_YEAR_PROD | Enables strict current year validation when generating a 10-day weather forecast bulletin preview in the (production) Admin page if `NEXT_PUBLIC_CHECK_RANGE_YEAR_PROD=1` |
| CHECK_RANGE_YEAR_DEV | Enables strict current year validation on the PAGASA 10-Day Weather Forecast Excel files if `CHECK_RANGE_YEAR_DEV=1`on the (development) environment. |
| CHECK_RANGE_YEAR_PROD | Enables strict current year validation on the PAGASA 10-Day Weather Forecast Excel files if `CHECK_RANGE_YEAR_PROD=1`on the (production) environment. |
| REGION_CODE                 | Region code number                                                                                                                                                                                                                                                                                                                                                                              |
| REGION_LAT_AND_LNG          | Center longitude (lon) and latitude (lat) of a region                                                                                                                                                                                                                                                                                                                                           |
| REGIONAL_FIELD_OFFICE       | Regional field office name                                                                                                                                                                                                                                                                                                                                                                      |
| REGION_URL                  | Regional field office website URL                                                                                                                                                                                                                                                                                                                                                               |
| CROPPING_CALENDAR_RICE_EXCEL_FILE | Cropping calendar "Rice" v2 Excel template file name |
| CROPPING_CALENDAR_CORN_EXCEL_FILE | Cropping calendar "Corn" v2 Excel template file name |
| RECOMMENDATIONS_RICE_EXCEL_FILE | Crop recommendations "Rice" v2 Excel template file name |
| RECOMMENDATIONS_CORN_EXCEL_FILE | Crop recommendations "Rice" v2 Excel template file name |
| IS_RMCAS_API_ACTIVE | Flag that enables or disables the ACAP-RCMAS API group. Default value is `0`.<br>Valid values are:<br><br>`0` or `undefined` (do not include this variable in the .env file): Makes the ACAP-RCMAS APIs unreachable<br>`1`: Makes the ACAP-RCMAS APIs accessbile for online use |
| ROOT_API_URL_DEV | Base URL of the backend's "Development" (server) REST API. This is the domain/origin where the backend is running minus the /api path segment.<br>Use [https://\<backend-server-dev\>.onrender.com](https://\<backend-server-dev\>.onrender.com). |
| ROOT_API_URL_PROD | Base URL of the backend's "Production" (server) REST API. This is the domain/origin where the backend is running minus the /api path segment.<br>Use [https://\<backend-server-prod\>.onrender.com](https://\<backend-server-prod\>.onrender.com). |
| ROOT_API_URL_VERCEL_DEV | Base URL of the "Development" backend (server) REST API deployed to Vercel, if deployment or CI/CD to Vercel is set up.<br>Exclude this from the .env file if (server) `DEPLOYMENT_PLATFORM=default`.<br>Use [https://\<backend-server-dev\>.vercel.app](https://\<backend-server-dev\>.vercel.app). |
| ROOT_API_URL_VERCEL_PROD | Base URL of the "Production" backend (server) REST API deployed to Vercel, if deployment or CI/CD to Vercel is set up.<br>Exclude this from the .env file if `DEPLOYMENT_PLATFORM=default`.<br>Use [https://\<backend-server-prod\>.vercel.app](https://\<backend-server-prod\>.vercel.app). |
| SPECIAL_CHARACTERS | Key-value pairs of special characters or garbled text and their normalized text conversions, delimited by the `":"` character.<br>Multiple key-value pairs are delimited by the `","` character.<br>If a special character key's value is a an empty string, write it as i.e.,: `"some-garbled-text:"` |

## Render Secrets

ACAP 2.0 now uses [Render Secrets](https://docs.render.com/docker-secrets) to use dynamic base API URL name when building the API documentation. Add the following Secrets aside from the Environment Variables in Render.

| Secret Name | Description |
| --- | --- |
| IS_RMCAS_API_ACTIVE | `1` - Enables ACAP-RCMAS API endpoints accessible and internal processes<br>`0` - Disables the ACAP-RCMAS APIs endpoints and internal processes
| LIVE_ORIGIN | Online base URL of the frontend website i.e., `https://acap-bicol.github.io` |
| REGION_NAME | Region name (similar to the `REGION_NAME` env variable) |
| ROOT_API_URL | Base URL of the Render backend's (server) REST API. This is the domain/origin where the backend is running minus the /api path segment.<br>Use [https://\<backend-server\>.onrender.com](https://\<backend-server\>.onrender.com). |


## Credits

A team of technical consultants and project proponents from the UPLBFI and the Alliance - Jonathan, Gaye (@JBalanzaCG), Leo, Dominick (@dilapitan), and Angel (@weaponsforge), in collaboration with the DA and the DA RFO 5 developed the ACAP-Bicol, which evolved into the ACAP used in this template code repository.

@ciatph<br>
20220405
