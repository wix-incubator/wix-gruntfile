'use strict';

const path = require('path');
const mysql = require('mysql');
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

const database = {
  connection: null,
  getConnection() {
    if (!this.connection) {
      this.connection = mysql.createConnection({
        host: process.env.FEDOPS_BUILD_REPORT_SQL_HOST,
        user: process.env.FEDOPS_BUILD_REPORT_SQL_USER,
        password: process.env.FEDOPS_BUILD_REPORT_SQL_PASS,
        database: process.env.FEDOPS_BUILD_REPORT_SQL_DB
      });
    }

    return this.connection;
  },
  end() {
    if (this.connection) {
      return new Promise((resolve, reject) => {
        this.connection.end(err => err ? reject(err) : resolve());
      });
    }

    return Promise.resolve();
  }
};

const reportBundleSize = params => {
  return new Promise(resolve => {
    return fsStatP(path.resolve(process.cwd(), params.bundleName))
      .then(stats => {
        const sql = 'INSERT INTO ?? (name, bundle_name, bundle_size) VALUES (?, ?, ?)';
        const values = [
          process.env.FEDOPS_BUILD_REPORT_SQL_TABLE,
          params.appName,
          path.relative(path.join(process.cwd(), 'dist/'), params.bundleName),
          stats.size || 0
        ];
        const handleQueryResult = err => {
          if (err) {
            console.warn(`Error code ${err.code}. Failed to write bundle size to the database.` +
							`App: ${params.appName}. Bundle: ${params.bundleName}.bundle.min.js`);
          }

          resolve();
				};
        database.getConnection().query(sql, values, handleQueryResult);
      })
      .catch(err => {
        console.warn(
          `Error code ${err.code}. Failed to find size of file ${params.bundleName}.bundle.min.js.`
        );
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
			return Promise.all(bundleNames.map(sendStream(fedopsJson)))
			.then(() => database.end())
			.then(() =>{
				done();
			});
    })
    .catch(() => {
      done();
    });
};
