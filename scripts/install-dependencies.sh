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
  $(npm bin)/bower cache clean
  $(npm bin)/bower install
  echo "##teamcity[blockClosed name='Bower Install']"
fi
