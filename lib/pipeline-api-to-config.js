propertyBlacklists = {
    root: ['_links', 'template', 'parameters'],
    tasks: ['run_if']
};

function mapProperty(collection, subProperty, value, result, key, index) {
    if(subProperty) {
        value = value[subProperty];
    }

    const mappedValue = (fieldMappers[key] || fieldMappers.default)(value[key], key, collection);

    if(mappedValue) {
        result[key] = mappedValue;
    }

    return result;
}

const fieldMappers = {
    default: (value, key, blacklist) => {
        if((propertyBlacklists[blacklist] && propertyBlacklists[blacklist].includes(key)) || value === null) {
            return;
        }

        return value;
    },
    materials: value => value.map(value => {
        if(value.attributes) {
            const result = Object.keys(value.attributes).reduce(mapProperty.bind(undefined, 'materials', 'attributes', value), value);
            delete value.attributes;
        }

        return value;
    }),
    stages: value => value.map(value => Object.keys(value).reduce(mapProperty.bind(undefined, 'stages', false, value), {})),
    jobs: value => value.map(value => Object.keys(value).reduce(mapProperty.bind(undefined, 'jobs', false, value), {})),
    tasks: (value) => value.map(value => {
        if(value.attributes) {
            const result = Object.keys(value.attributes).reduce(mapProperty.bind(undefined, 'tasks', 'attributes', value), value);
            delete value.attributes;
        }

        return value;
    })
};

module.exports = apiResponse => Object.keys(apiResponse)
    .reduce((result, key) => {
        if(propertyBlacklists['root'].includes(key) || apiResponse[key] === null) {
            return result;
        }

        result[key] = (fieldMappers[key] || fieldMappers.default)(apiResponse[key]);

        return result;
    }, {});
