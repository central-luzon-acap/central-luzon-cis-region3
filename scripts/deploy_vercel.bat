:: This script require a global installation of the Vercel CLI
:: 1. First, run "vercel logout/login"
:: 2. Link the project with "vercel link"
:: Relpace VERCEL_TOKEN with the value of your Vercel push toke

vercel pull --yes --environment=production --token=VERCEL_TOKEN
vercel build --prod --token=VERCEL_TOKEN
vercel deploy --prod --token=VERCEL_TOKEN