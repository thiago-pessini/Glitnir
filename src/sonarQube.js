/*jslint es6 */
let params;
const setParams = function(p) {
    "use strict";
    params = p;
};

const loadMeasures = async function() {
    "use strict";

    const Request = require('request');
    console.log('Starting sonarqube mapping...');
    const urlSonarProjects = params.sonarqube_host + '/api/projects';

    let promise = new Promise(function(resolve, reject) {
        "user strict";
        Request.get(urlSonarProjects, function(error, response, body) {
            if (error) {
                reject(error);
            } else {
                resolve(JSON.parse(body));
            }
        }).auth(params.sonarqube_token);
    });

    promise.then(function(projects) {
        "user strict";
        const filters = 'metricKeys=quality_gate_details&componentKey=';
        const urlSonarMeasure = params.sonarqube_host + '/api/measures/component?' + filters;
        let promises = [];
        for (let i = 0; i < projects.length; i++) {
            promises[i] = new Promise(function(resolve, reject) {
                Request.get(urlSonarMeasure + projects[i].k, function(error, response, body) {
                    if (error) {
                        reject(error);
                    } else {
                        let resp = JSON.parse(body);
                        if (resp && resp.component && typeof(resp.component.measures) !== 'undefined') {
                            let obj = {
                                projectName: resp.component.name,
                                conditions: JSON.parse(resp.component.measures[0].value).conditions
                            };
                            const urlKvasir = params.kvasir_host + '/api/' + params.kvasir_version + '/kvasir/sonarqube'
                            Request.post(urlKvasir, { json: obj }, function(error, response, body) {
                                if (error) {
                                    reject(error);
                                } else {
                                    console.log("Metrics sent for project %s", resp.component.name);
                                    resolve();
                                }
                            });
                        } else {
                            throw new Exception("Failed parsing element $s", resp)
                        }
                        resolve();
                    }
                }).auth(params.sonarqube_token)
            });
        }
    }, function(error) {
        console.error(error);

    })
}
module.exports = { loadMeasures, setParams };