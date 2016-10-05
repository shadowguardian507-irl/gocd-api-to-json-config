const http = require('http');

module.exports = (host, pipeline, credentials) => new Promise((resolve, reject) => {
    const usernameAndPassword = `${credentials.username}:${credentials.password}`;
    let port = 8153;

    if(host.includes(':')) {
        const splitHost = host.split(':');
        host = splitHost[0];
        port = splitHost[1];
    }

    http.request({
        host: host,
        port: port,
        path: `/go/api/admin/pipelines/${pipeline}`,
        headers: {
            'Authorization': `Basic ${new Buffer(usernameAndPassword).toString('base64')}`,
            'Accept': 'application/vnd.go.cd.v1+json'
        }
    }, (response) => {
        if(response.statusCode !== 200) {
            if(response.statusCode === 401) {
                return reject(`Authentication failed`);
            }

            if(response.statusCode === 404) {
                return reject(`Could not find pipeline ${pipeline}`);
            }

            return reject(`GO returned non-success response: ${response.statusCode} for pipeline ${pipeline}`);
        }

        const allData = [];

        response.on('data', chunk => allData.push(chunk));
        response.on('end', () => resolve(JSON.parse(allData.join(''))));
    }).end();
});
