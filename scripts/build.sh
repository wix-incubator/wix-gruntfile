#!/bin/bash
set -e

echo "##teamcity[blockOpened name='Bundle Install']"
rm -rf .bundle
rm -rf vendor
bundle install --path vendor/bundle
echo "##teamcity[blockClosed name='Bundle Install']"

if [ -d node_modules/bower ];then
  echo "##teamcity[blockOpened name='Bower Install']"
  rm -rf app/bower_components
  node_modules/bower/bin/bower cache clean
  node_modules/bower/bin/bower install
  echo "##teamcity[blockClosed name='Bower Install']"
fi

echo "##teamcity[blockOpened name='Grunt Build']"
node_modules/grunt-cli/bin/grunt build:ci
echo "##teamcity[blockClosed name='Grunt Build']"

echo "##teamcity[blockOpened name='Grunt Test']"
node_modules/grunt-cli/bin/grunt test:ci
echo "##teamcity[blockClosed name='Grunt Test']"
