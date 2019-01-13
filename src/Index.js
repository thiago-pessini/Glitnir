const Request = require('request');

console.log('Loading parameters...');
if (process.env.NODE_ENV !== 'production') {
    const result = require('dotenv').config();
    if (result.error) {
        console.info("Error while loading environment variables: ", result);
    }
};

const params = {
    sonarqube_host: process.env.SONARQUBE_HOST,
    sonarqube_token: process.env.SONARQUBE_TOKEN,
    kvasir_host: process.env.KVASIR_HOST,
    kvasir_version: process.env.KVASIR_VERSION,
};
console.log('Parameters were loaded successfully!');

console.log('Starting sonarqube mapping!');
const urlSonar = params.sonarqube_host + '/api/projects';

let promise = new Promise((resolve, reject) => {
    Request.get(urlSonar, (error, response, body) => {
        if (error) {
            reject(error);
        } else {
            resolve(JSON.parse(body));
        }
    }).auth(params.sonarqube_token);
});

promise.then((projects) => {
    const filters = 'metricKeys=quality_gate_details&componentKey=';
    const urlSonar = params.sonarqube_host + '/api/measures/component?' + filters;
    let promises = [];
    for (let i = 0; i < projects.length; i++) {
        promises[i] = new Promise((resolve, reject) => {
            Request.get(urlSonar + projects[i].k, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    let resp = JSON.parse(body);
                    if (typeof (resp.component.measures) !== 'undefined') {
                        let obj = {
                            productName: resp.component.name,
                            conditions: JSON.parse(resp.component.measures[0].value).conditions
                        };
                        const urlKvasir = params.kvasir_host + '/api/' + params.kvasir_version + '/kvasir/quality-gates'
                        Request.post(urlKvasir, { json: obj }, (error, response, body) => {
                            if (error) {
                                reject(error);
                            } else {
                                console.log("Metrics send for project " + resp.component.name);
                            }
                        });
                    } else {
                        throw new Exception("Failed parsing element " + resp.component.name)
                    }
                    resolve();
                }
            }).auth(params.sonarqube_token)
        });
    }

}, (error) => {
    console.error(error);
})
