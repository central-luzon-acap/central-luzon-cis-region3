## generate-docs

This script generates the ACAP's (NodeJS) REST API documentation using [apidoc](https://github.com/apidoc/apidoc).

It generates dynamic values for the API's base URLs and other content, such as region names and others from environment (`.env`) variables.

When extending this script, please observe how the `"npm run gen:docs"` or `"npm run gen:docs:vercel"` scripts call it and how it uses some environment variables in the following files:

- generate-docs.js
- /templates/*.md (all markdown files)
- /config/apidoc.js

## Notes

### Deployment to Render

- If you are deploying the server to Render, please ensure that all environment variables that the `generate-docs.js` script uses are available in the Render Secrets dashboard.

- Furthermore, initialize these Render Secret variables in the Dockerfile's **BUILD API DOCUMENTATION - RUN** script.

@ciatph<br>
20240628
