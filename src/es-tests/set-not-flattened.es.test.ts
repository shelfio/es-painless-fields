import {Client} from '@elastic/elasticsearch';
import painlessFields from '../index.js';

const client = new Client({node: process.env.ES_URL});

describe('#setNotFlattened', () => {
  it('should set not flattended fields in ES', async () => {
    await client.create({
      index: 'files-alias',
      id: 'some-file-60',
      body: {name: 'Tytanic', meta: {actors: [], year: 2001, extra: {rating: 9.0}}},
      refresh: true,
    });

    const fieldsMap = {
      id: 'film-id-1',
      name: 'titanic',
      meta: {
        year: 1997,
        hasOscar: true,
        actors: [{name: 'Kate Winslet'}, {name: 'Leonardo DiCaprio'}],
        extra: {
          rating: 9.1,
        },
      },
    };

    const painlessScript = painlessFields.setNotFlattened(fieldsMap);

    await client.update({
      index: 'files-alias',
      id: 'some-file-60',
      body: {
        script: painlessScript,
      },
      refresh: true,
    });

    const updatedDoc = await client.get({
      index: 'files-alias',
      id: 'some-file-60',
    });

    expect(updatedDoc._source).toEqual({
      id: 'film-id-1',
      meta: {
        actors: [
          {
            name: 'Kate Winslet',
          },
          {
            name: 'Leonardo DiCaprio',
          },
        ],
        extra: {
          rating: 9.1,
        },
        hasOscar: true,
        year: 1997,
      },
      name: 'titanic',
    });
  });

  it('use set not flattended with safe mode', async () => {
    await client.create({
      index: 'files-alias',
      id: 'some-file-61',
      body: {name: 'Avatar 2'},
      refresh: true,
    });

    const fieldsMap = {
      meta: {
        year: 2022,
        hasOscar: false,
        extra: {
          rating: 9.5,
          actors: ['Sam Worthington', 'Zoe Saldaña'],
        },
      },
    };

    const painlessScript = painlessFields.setNotFlattened(fieldsMap, true);

    await client.update({
      index: 'files-alias',
      id: 'some-file-61',
      body: {
        script: painlessScript,
      },
      refresh: true,
    });

    const updatedDoc = await client.get({
      index: 'files-alias',
      id: 'some-file-61',
    });

    expect(updatedDoc._source).toEqual({
      meta: {
        extra: {
          rating: 9.5,
          actors: ['Sam Worthington', 'Zoe Saldaña'],
        },
        hasOscar: false,
        year: 2022,
      },
      name: 'Avatar 2',
    });
  });
});
