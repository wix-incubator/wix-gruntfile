#!/bin/bash

$NODE_HOME/node node_modules/grunt-cli/bin/grunt checkIfBower
if [ $? -ne 0 ]; then
    exit 0
fi

PROJECT_DIR=$(pwd)
cd /tmp
rm -rf bower_component
git clone $GIT_REMOTE_URL bower_component
cd bower_component
CURRENT_REVISION=`git rev-parse HEAD`
echo "CURRENT_REVISION=$CURRENT_REVISION"
echo "BUILD_SHA=$BUILD_SHA"
if [ "$CURRENT_REVISION" != "$BUILD_SHA" ]; then
    echo "##teamcity[message text='New changes committed' status='ERROR']"
    exit 1
fi
git checkout bower-component
git checkout -b bower-component
git push origin bower-component
shopt -s extglob dotglob

rm -rf !(.git)
cp -r $PROJECT_DIR/!(.git) .

grep -v dist .gitignore > .gitignore.new
mv -f .gitignore.new .gitignore
git add --all .
git reset HEAD bower.json
git diff --exit-code --cached --stat
if [ $? -ne 0 ]; then
    $NODE_HOME/node node_modules/grunt-cli/bin/grunt release
fi
