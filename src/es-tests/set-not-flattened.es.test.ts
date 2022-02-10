import {Client} from '@elastic/elasticsearch';
import painlessFields from '../index';

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

    expect(updatedDoc.body._source).toEqual({
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
});
