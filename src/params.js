/*jslint es6 */
"use strict";
const loadParams = function() {
    console.log('Loading parameters...');
    if (process.env.NODE_ENV !== 'production') {
        const result = require('dotenv').config();
        if (result.error) {
            console.info("Error while loading environment variables: ", result);
        }
    }
    console.log('Parameters were loaded successfully!');
    return {
        sonarqube_host: process.env.SONARQUBE_HOST,
        sonarqube_token: process.env.SONARQUBE_TOKEN,
        kvasir_host: process.env.KVASIR_HOST,
        kvasir_version: process.env.KVASIR_VERSION,
        cron: process.env.CRON || "*/15 * * * 1-5"
    };
};

module.exports = { loadParams };