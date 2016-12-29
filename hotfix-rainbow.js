const fs = require('fs');
try {
    const data = fs.readFileSync('Gemfile', {encoding:'utf8'});

    if (data.indexOf('rake') === -1) {
        const result = data.replace(/(source \'https:\/\/rubygems.org\')/, '$1\n\ngem \'rake\'\n');
        fs.writeFileSync('Gemfile', result, 'utf8');
    }
} catch (e) {}

