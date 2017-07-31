'use strict';

const path = require('path');
const graphite = require('graphite-tcp');
const fs = require('fs');
const glob = require('glob');

const fsStatP = filePath => new Promise((resolve, reject) => {
	fs.stat(filePath, (err, stats) => {
		if (err) {
			reject(err);
		} else {
			resolve(stats);
		}
	});
});

const globAsync = (patter, options) => new Promise((resolve, reject) => {
	glob(patter, options, (err, matches) => {
		if (err) {
			reject(err);
			return;
		}

		resolve(matches);
	});
});

const getBundleNames = () => {
	return globAsync(path.resolve(process.cwd(), 'dist/@(scripts|styles)/*.@(js|css)'));
};

const replaceDotsWithUnderscore = str => str.replace(/\./g, '_');

const command = (appName, bundleName) => {
	const metricNames = {
		app_name: replaceDotsWithUnderscore(appName), // eslint-disable-line camelcase
		bundle_name: replaceDotsWithUnderscore(path.relative(path.join(process.cwd(), 'dist/'), bundleName)), // eslint-disable-line camelcase
	};

	const metricNamesSeparator = '.';
	const bundleSizeMetricName = 'bundle_size';

	return ''.concat(
		Object.keys(metricNames).map(key => `${key}=${metricNames[key]}`).join(metricNamesSeparator),
		metricNamesSeparator,
		`${bundleSizeMetricName}`
	);
};

const reportBundleSize = params => {
	return new Promise(resolve => {
		return fsStatP(path.resolve(process.cwd(), params.bundleName))
			.then(stats => {
				const metric = graphite.createClient({
					host: 'm.wixpress.com',
					port: 2003,
					prefix: 'wix-bi-tube.root=events_catalog.src=72',
					callback: () => {
						resolve();
						metric.close();
					}
				});
				metric.put(command(params.appName, params.bundleName), stats.size || 0);
			})
			.catch(err => {
				resolve();
			});
	});
};

const reportBundleForApp = bundleName => fedopsJson => {
	const appName = fedopsJson.app_name || fedopsJson.appName;
	const params = {
		appName,
		bundleName
	};

	if (!appName) {
		return Promise.resolve();
	}

	return reportBundleSize(params);
};

const sendStream = config => bundleName => {
	const promises = [].concat(config).map(reportBundleForApp(bundleName));
	return Promise.all(promises);
};

module.exports = function fedopsBundleSize(fedopsJson, done) {
	return getBundleNames()
		.then((bundleNames) => {
			return Promise.all(bundleNames.map(sendStream(fedopsJson))).then(() => {
				done();
			});
		})
		.catch(() => {
			done();
		});
};
