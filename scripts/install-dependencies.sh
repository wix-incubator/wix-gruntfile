#!/bin/bash
set -e

rm -rf .bundle
rm -rf vendor
bundle install --path vendor/bundle

if [ -d node_modules/bower ];then
  rm -rf app/bower_components
  $NODE_HOME/node node_modules/bower/bin/bower cache clean
  $NODE_HOME/node node_modules/bower/bin/bower install
fi
