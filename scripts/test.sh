#!/bin/bash
set -e

echo "##teamcity[blockOpened name='Grunt Build']"
node_modules/grunt-cli/bin/grunt build:ci
echo "##teamcity[blockClosed name='Grunt Build']"

echo "##teamcity[blockOpened name='Grunt Test']"
node_modules/grunt-cli/bin/grunt test:ci
echo "##teamcity[blockClosed name='Grunt Test']"
