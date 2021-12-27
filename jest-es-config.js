const mappings = require('./mappings.json');

module.exports = () => {
  return {
    esVersion: '7.15.2',
    clusterName: 'files',
    nodeName: 'files',
    port: 9200,
    indexes: [
      {
        name: 'files',
        body: {
          settings: {
            number_of_shards: '1',
            number_of_replicas: '0',
            analysis: {
              normalizer: {
                case_insensitive_normalizer: {
                  type: 'custom',
                  char_filter: [],
                  filter: ['lowercase', 'asciifolding'],
                },
              },
            },
          },
          aliases: {
            'files-alias': {},
          },
          mappings,
        },
      },
    ],
  };
};
