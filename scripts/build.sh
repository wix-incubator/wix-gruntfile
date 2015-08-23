#!/bin/bash
set -e
trap "killall sc sc-osx && true" EXIT

node_modules/wix-gruntfile/scripts/install-dependencies.sh
node_modules/wix-gruntfile/scripts/grunt-build.sh
