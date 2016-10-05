const program = require('commander');
const getGoPipelineConfig = require('./lib/go-pipeline-api-request');
const mapToConfigFormat = require('./lib/pipeline-api-to-config');
const loadCredentials = require('./lib/load-credentials');
const fs = require('fs');


function writePipelineConfigToFile(config, fileName) {
    return new Promise((resolve, reject) => {
        fileName = fileName || `${config.name.toLowerCase()}.gopipeline.json`;

        fs.writeFile(`${__dirname}/${fileName}`, JSON.stringify(config, null, 4), 'utf-8', err => {
            if(err) {
                return reject(`Could not write file: ${fileName}, ${err}`);
            }

            console.log(`Successfully wrote file ${fileName}`);
        });
    })
}

program
    .version('0.0.1')
    .description('Retrieves pipeline configuration from the target Go Server/Pipeline and saves it to the specified file, please specify your go credentials in the .go-credentials file.')
    .option('-p, --pipeline <pipeline>', 'GO Pipeline to retrieve from the API')
    .option('-h, --host <host>', 'GO Server host')
    .option('-o, --output [output]', 'Output filename')
    .parse(process.argv)

if(!program.pipeline) {
    console.error('You must specifiy a pipeline.');
    process.exit(1);
}

if(!program.host) {
    console.error('You must specifiy a go host.');
    process.exit(1);
}

loadCredentials()
    .then(credentials => getGoPipelineConfig(program.host, program.pipeline, credentials))
    .then(response => mapToConfigFormat(response))
    .then(config => writePipelineConfigToFile(config))
    .catch(err => console.error(err));
