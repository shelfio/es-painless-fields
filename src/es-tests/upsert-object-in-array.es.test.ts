import {Client} from '@elastic/elasticsearch';
import painlessFields from '../index.js';

const client = new Client({node: process.env.ES_URL});

describe('#upsertObjectInArray', () => {
  it('should insert object in array if target object exists', async () => {
    await client.create({
      index: 'files-alias',
      id: 'some-file-30',
      body: {name: 'Wolf from wall street'},
      refresh: true,
    });

    const painlessScript = painlessFields.upsertObjectInArray({
      arrayFieldName: 'actors',
      targetObject: {fieldName: 'id', fieldValue: 'actor-id-1'},
      fieldsToUpsert: {name: 'Margot Robbie', sex: 'female'},
    });

    await client.update({
      index: 'files-alias',
      id: 'some-file-30',
      body: {
        script: painlessScript,
      },
      refresh: true,
    });

    const updatedDoc = await client.get({
      index: 'files-alias',
      id: 'some-file-30',
    });

    expect(updatedDoc._source).toEqual({
      actors: [
        {
          name: 'Margot Robbie',
          sex: 'female',
        },
      ],
      name: 'Wolf from wall street',
    });
  });

  it('should update object in array if object exists and has fields to update', async () => {
    await client.create({
      index: 'files-alias',
      id: 'some-file-31',
      body: {
        name: 'Wolf from wall street',
        actors: [{id: 'actor-id-1', name: 'Margo Robbie', sex: 'female'}],
      },
      refresh: true,
    });

    const painlessScript = painlessFields.upsertObjectInArray({
      arrayFieldName: 'actors',
      targetObject: {fieldName: 'id', fieldValue: 'actor-id-1'},
      fieldsToUpsert: {name: 'Margot Robbie'},
    });

    await client.update({
      index: 'files-alias',
      id: 'some-file-31',
      body: {
        script: painlessScript,
      },
      refresh: true,
    });

    const updatedDoc = await client.get({
      index: 'files-alias',
      id: 'some-file-31',
    });

    expect(updatedDoc._source).toEqual({
      actors: [
        {
          id: 'actor-id-1',
          name: 'Margot Robbie',
          sex: 'female',
        },
      ],
      name: 'Wolf from wall street',
    });
  });

  it('should insert object in array if target object exists and arrayFieldName is nested', async () => {
    await client.create({
      index: 'files-alias',
      id: 'some-file-32',
      body: {name: 'Wolf from wall street', data: {film: {}}},
      refresh: true,
    });

    const painlessScript = painlessFields.upsertObjectInArray({
      arrayFieldName: 'data.film.actors',
      targetObject: {fieldName: 'id', fieldValue: 'actor-id-1'},
      fieldsToUpsert: {name: 'Margot Robbie', sex: 'female'},
    });

    await client.update({
      index: 'files-alias',
      id: 'some-file-32',
      body: {
        script: painlessScript,
      },
      refresh: true,
    });

    const updatedDoc = await client.get({
      index: 'files-alias',
      id: 'some-file-32',
    });

    expect(updatedDoc._source).toEqual({
      data: {
        film: {
          actors: [
            {
              name: 'Margot Robbie',
              sex: 'female',
            },
          ],
        },
      },
      name: 'Wolf from wall street',
    });
  });
});
