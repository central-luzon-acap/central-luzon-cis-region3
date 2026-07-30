### Introduction

The ACAP {{REGION_NAME}} APIs are a set of secure REST API endpoints for requesting and managing ACAP {{REGION_NAME}} data over HTTPS.

### Information

This API is the official version of ACAP 2.0 {{REGION_NAME}}'s live API, integrated with the ACAP-RCMAS APIs.

The **ACAP-RCMAS APIs** are a set of endpoints that share ACAP {{REGION_NAME}}'s internal PAGASA Weather Forecast data with Collaborators for testing using IRRI's RCMAS project. The ACAP-RMAS APIs, deployed to an isolated, stand-alone environment before ACAP 2.0, now share the same code base and data sources with ACAP 2.0 as of "July 5, 2024".

- [PAGASA Weather Forecast API](#api-PAGASA_Weather_Forecast)
- [PAGASA Historical Weather Forecast API](#api-PAGASA_Historical_Weather_Forecast)

### Partners

<a href="https://bicol.da.gov.ph/" target="_blank">
  <img alt="darfo5" src="assets/da-rfo-logo.png" width="84px" height="80px">
</a>

<a href="https://www.da.gov.ph/" target="_blank">
  <img alt="amia" src="assets/amia-logo.png" width="84px" height="80px">
</a>

<a href="https://uplbfi.org/" target="_blank">
  <img alt="uplbfi" src="assets/fi-logo.png" width="84px" height="80px">
</a>

<a href="https://alliancebioversityciat.org/" target="_blank">
  <img alt="ciat" src="assets/alliance-logo_2.png" width="173px" height="80px">
</a>

<a href="https://www.pagasa.dost.gov.ph/" target="_blank">
  <img alt="dost-pagasa" src="assets/pagasa-logo.png" width="80px" height="80px">
</a>

<br><br>

#### PAGASA Rainfall Legends

Below are rainfall percentage values and corresponding seasonal and 10-day weather forecast labels for reference.

| Seasonal Rainfall (%) | PAGASA Seasonal Labels | PAGASA 10-Day Labels | PAGASA 10-Day Rainfall Amount Descriptive Text |
| --------------------- | ---------------------- | -------------------- | ---------------------------------------------- |
| <= 40%                | Way below normal       | NO RAIN              | No rain is expected within the day             |
| 41% - 80%             | Below normal           | LIGHT RAINS          | Less than 60mm of rain within 24 hours         |
| 81% - 120%            | Normal                 | MODERATE RAINS       | 60mm - 180mm of rain within 24 hours           |
| value > 120%          | Above normal           | HEAVY RAINS          | Greater than 180mm of rain within 24 hours     |

### Live Official ACAP {{REGION_NAME}} Website

You can view PAGASA's weather forecast data in action in the official ACAP {{REGION_NAME}} website at:
- [{{LIVE_ORIGIN}}/]({{LIVE_ORIGIN}}/weather-services/#ten-day-weather-forecast)

## ACAP {{REGION_NAME}} API

The ACAP {{REGION_NAME}} website uses the official ACAP {{REGION_NAME}} API at:
- [{{http://RENDER_API_URL}}/docs]({{http://RENDER_API_URL}}/docs)

<br>
<br>

![img](assets/img_acap_rcmas.png)
