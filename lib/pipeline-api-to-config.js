
propertyBlacklists = {
    root: ['_links', 'template', 'parameters'],
    task: ['run_if']
};

const fieldMappers = {
    default: (value, key, blacklist) => {
        if((propertyBlacklists[blacklist] && propertyBlacklists[blacklist].includes(key)) || value === null) {
            return;
        }

        return value;
    },
    materials: value => value.map(value => {
        const result = Object.keys(value.attributes).reduce((result, key) => {
            if((propertyBlacklists['material'] && propertyBlacklists['material'].includes(key)) || value.attributes[key] === null) {
                return result;
            }

            result[key] = value.attributes[key];

            return result;
        }, value);
        delete value.attributes;
        return result;
    }),
    stages: value => value.map(value => {
        return Object.keys(value).reduce((result, key) => {
            const mappedValue = (fieldMappers[key] || fieldMappers.default)(value[key], key, 'stages');

            if(mappedValue) {
                result[key] = mappedValue;
            }

            return result;
        }, {});
    }),
    jobs: value => value.map(value => {
        return Object.keys(value).reduce((result, key) => {
            const mappedValue = (fieldMappers[key] || fieldMappers.default)(value[key], key, 'jobs');

            if(mappedValue) {
                result[key] = mappedValue;
            }

            return result;
        }, {});
    }),
    tasks: (value) => value.map(value => {
        if(value.attributes) {
            const result = Object.keys(value.attributes).reduce((result, key) => {
                const mappedValue = (fieldMappers[key] || fieldMappers.default)(value.attributes[key], key, 'tasks');

                if(mappedValue) {
                    result[key] = mappedValue;
                }

                return result;
            }, value);
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
