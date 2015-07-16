#!/bin/bash
set -e

$NODE_HOME/node node_modules/grunt-cli/bin/grunt build:ci --no-color

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

$NODE_HOME/node node_modules/grunt-cli/bin/grunt test:ci --no-color
