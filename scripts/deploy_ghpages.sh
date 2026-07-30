#!/bin/bash

# This script copies public files to the NextJS "out" export directory

# Optional: Copy the google search console verification file
# if you have one from https://search.google.com/search-console
cp config/*.html out/

# Use the prod site's URL in the sitemap
sed "s|{{LIVE_ORIGIN}}|${LIVE_ORIGIN}|g" config/sitemap_template.txt > config/sitemap.txt
cp config/sitemap.txt out/
