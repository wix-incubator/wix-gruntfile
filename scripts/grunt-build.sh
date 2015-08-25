#!/bin/bash
set -e

echo "##teamcity[blockOpened name='Grunt Build']"
$(npm bin)/grunt build:ci
echo "##teamcity[blockClosed name='Grunt Build']"
exit 0

echo "##teamcity[blockOpened name='Sauce Tunnel']"
rm -f /tmp/sauce-connect-ready
rm -f /tmp/sc.pid
SAUCE_TUNNEL="node_modules/wix-gruntfile/scripts/sc"
if [ "`uname`" = "Darwin" ]; then
    SAUCE_TUNNEL="node_modules/wix-gruntfile/scripts/sc-osx"
fi

$SAUCE_TUNNEL \
  --readyfile /tmp/sauce-connect-ready \
  --tunnel-identifier $BUILD_NUMBER \
  --user $SAUCE_USERNAME \
  --api-key $SAUCE_ACCESS_KEY \
  --logfile /tmp/sc.log \
  --tunnel-domains localhost \
  --pidfile /tmp/sc.pid &

while [ ! -f /tmp/sauce-connect-ready ]; do
  echo "Waiting for Sauce Labs..."
  sleep 5
  if [ ! -f /tmp/sc.pid ]; then
    echo "##teamcity[message text='Sauce tunnel failed to start' status='ERROR']"
    exit 1
  fi
  ps $(cat /tmp/sc.pid) > /dev/null
  if [ $? -ne 0 ]; then
    echo "##teamcity[message text='Sauce tunnel died' status='ERROR']"
    exit 1
  fi
done
echo "##teamcity[blockClosed name='Sauce Tunnel']"

echo "##teamcity[blockOpened name='Grunt Test']"
$(npm bin)/grunt test:ci
echo "##teamcity[blockClosed name='Grunt Test']"
