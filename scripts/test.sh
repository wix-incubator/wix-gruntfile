#!/bin/bash
set -e

echo "##teamcity[blockOpened name='Grunt Test']"
node_modules/grunt-cli/bin/grunt test:ci
echo "##teamcity[blockClosed name='Grunt Test']"
