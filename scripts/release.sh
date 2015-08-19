#!/bin/bash

echo "##teamcity[blockOpened name='Grunt Release']"
$(npm bin)/grunt checkIfBower
if [ $? -ne 0 ]; then
    exit 0
fi

PROJECT_DIR=$(pwd)
cd /tmp
rm -rf bower_component
git clone $GIT_REMOTE_URL bower_component
cd bower_component
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
    $(npm bin)/grunt publish
fi
echo "##teamcity[blockClosed name='Grunt Release']"
