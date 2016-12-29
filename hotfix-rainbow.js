const fs = require('fs');
const data = fs.readFileSync('Gemfile', {encoding:'utf8'});

if (data.indexOf('rainbow') === -1) {
    const result = data.replace(/(source \'https:\/\/rubygems.org\')/, '$1\n\ngem \'rainbow\', \'=2.1.0\'\n');
    fs.writeFileSync('Gemfile', result, 'utf8');
}

