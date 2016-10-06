const http = require('http');

function findPipelinesForGroup(groups, group) {
    for(let x = 0; x < groups.length; x++) {
        if(groups[x].name === group) {
            return groups[x].pipelines.map(pipeline => pipeline.name);
        }
    }
}

module.exports = (config) => new Promise((resolve, reject) => {
    const usernameAndPassword = `${config.username}:${config.password}`;
    let port = 8153;
    let host = config.host;

    if(host.includes(':')) {
        const splitHost = host.split(':');
        host = splitHost[0];
        port = splitHost[1];
    }

    http.request({
        host: host,
        port: port,
        path: `/go/api/config/pipeline_groups/`,
        headers: {
            'Authorization': `Basic ${new Buffer(usernameAndPassword).toString('base64')}`
        }
    }, (response) => {
        if(response.statusCode !== 200) {
            if(response.statusCode === 401) {
                return reject(`Authentication failed`);
            }

            return reject(`GO returned non-success response: ${response.statusCode} for pipeline groups.`);
        }

        const allData = [];

        response.on('data', chunk => allData.push(chunk));
        response.on('end', () => {
            const parsedData = JSON.parse(allData.join(''));

            return resolve(findPipelinesForGroup(parsedData, config.group));
        });
    }).end();
});
