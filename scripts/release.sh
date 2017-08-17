#!/bin/bash

echo "##teamcity[blockOpened name='Grunt Release']"
node_modules/grunt-cli/bin/grunt checkIfBower
if [ $? -ne 0 ]; then
    exit 0
fi

# bump package.json
node_modules/wnpm-ci/scripts/wnpm-release.js --no-shrinkwrap

node_modules/bower/bin/bower register $(jq .name bower.json -r) $GIT_REMOTE_URL --force

PROJECT_DIR=$(pwd)
cd /tmp
rm -rf bower_component
git clone $GIT_REMOTE_URL bower_component
cd bower_component
git checkout bower-component
git checkout -b bower-component
git push origin bower-component
shopt -s extglob dotglob

rm -rf !(.git|.|..)
cp -r $PROJECT_DIR/!(.git|.|..) .
grep -ve "^\(dist\|/.*\.js\)$" .gitignore > .gitignore.new
mv -f .gitignore.new .gitignore
git add --all .
git reset HEAD bower.json
git diff --exit-code --cached --stat

if [ $? -ne 0 ]; then
    node_modules/grunt-cli/bin/grunt publish
fi
echo "##teamcity[blockClosed name='Grunt Release']"
