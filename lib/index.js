const program = require('commander');
const getGoPipelineConfig = require('./go-pipeline-api-request');
const getPipelineForGroup = require('./go-pipeline-groups-api-request');
const mapToConfigFormat = require('./pipeline-api-to-config');
const loadCredentials = require('./load-credentials');
const fs = require('fs');

function writePipelineConfigToFile(config, fileName) {
    return new Promise((resolve, reject) => {
        fileName = fileName || `${config.name.toLowerCase()}.gopipeline.json`;

        fs.writeFile(`${process.cwd()}/${fileName}`, JSON.stringify(config, null, 4), 'utf-8', err => {
            if(err) {
                return reject(`Could not write file: ${fileName}, ${err}`);
            }

            console.log(`Successfully wrote file ${fileName}`);
        });
    })
}

function getPipelinesForPipeline(config) {
    return new Promise(resolve => resolve([config.pipeline]));
}

function exportPipelines(config) {
    const getPipelines = config.group ? getPipelineForGroup : getPipelinesForPipeline;

    return getPipelines(config)
        .then(pipelines => Promise.all(pipelines.map(pipeline => getGoPipelineConfig(config, pipeline)
            .then(mapToConfigFormat)
            .then(pipeline => new Promise(resolve => {
                if(config.targetGroup || config.group) {
                    pipeline.group = config.targetGroup || config.group;
                }

                resolve(pipeline);
            }))
            .then(writePipelineConfigToFile))));
}

function getData(config) {
    loadCredentials()
        .then(credentials => ({
            username: credentials.username,
            password: credentials.password,
            host: config.host,
            pipeline: config.pipeline,
            group: config.group,
            targetGroup: config.targetGroup
        }))
        .then(exportPipelines)
        .catch(err => console.error(err));
}

module.exports = function() {
    program
        .version('2.0.1')
        .description('Retrieves pipeline configuration from the target Go Server/Pipeline and saves it to the specified file, please specify your go credentials in the .go-credentials file.')
        .option('-h, --host <host>', 'GO Server host')
        .option('-g, --targetgroup <targetgroup>', 'GO Pipeline Group to set pipelines for (required for pipeline mode)');

    program
        .command('pipeline [pipeline]')
        .description('Export configuration for the specified pipeline')
        .action(pipeline => getData({
            host: program.host,
            pipeline: pipeline,
            targetGroup: program.targetgroup
        }));

    program
        .command('group [group]')
        .description('Export all pipeline configuration for the specified group')
        .action(group => getData({
            host: program.host,
            group: group,
            targetGroup: program.targetgroup
        }));

    program.parse(process.argv);
};
