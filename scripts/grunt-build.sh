#!/bin/bash
set -e

echo "##teamcity[blockOpened name='Grunt Build']"
$NODE_HOME/node node_modules/grunt-cli/bin/grunt build:ci
echo "##teamcity[blockClosed name='Grunt Build']"

echo "##teamcity[blockOpened name='Sauce Tunnel']"
rm -f /tmp/sauce-connect-ready
node_modules/wix-gruntfile/scripts/sc \
    --readyfile /tmp/sauce-connect-ready \
    --tunnel-identifier $BUILD_NUMBER \
    --user $SAUCE_USERNAME \
    --api-key $SAUCE_ACCESS_KEY \
    --logfile /tmp/sc.log \
    --tunnel-domains localhost &

while [ ! -f /tmp/sauce-connect-ready ]; do
  echo "Waiting for Sauce Labs..."
  sleep 5
done
echo "##teamcity[blockClosed name='Sauce Tunnel']"

echo "##teamcity[blockOpened name='Grunt Test']"
$NODE_HOME/node node_modules/grunt-cli/bin/grunt test:ci
echo "##teamcity[blockClosed name='Grunt Test']"
