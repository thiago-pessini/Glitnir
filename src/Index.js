/*jslint es6 */
"use strict";
const schedule = require('node-schedule');
const sonarQube = require('./sonarQube');
const params = require('./params');

//Load global params
const globalParams = params.loadParams();
sonarQube.setParams(globalParams);
//sonarQube.loadMeasures();
schedule.scheduleJob(globalParams.cron, sonarQube.loadMeasures);