import {Client} from '@elastic/elasticsearch';
import painlessFields from '../index';

const client = new Client({node: process.env.ES_URL});

describe('#updateObjectInArray', () => {
  it('should update object in array if it exists and has fields to update', async () => {
    await client.create({
      index: 'files-alias',
      id: 'some-file-20',
      body: {
        name: 'Wolf from wall street',
        actors: [{id: 'actor-id-1', name: 'Leonardo Dicaprio', hasOscar: false}],
      },
      refresh: true,
    });

    const painlessScript = painlessFields.updateObjectInArray({
      arrayFieldName: 'actors',
      targetObject: {fieldName: 'id', fieldValue: 'actor-id-1'},
      fieldsToUpdate: {name: 'Leonardo DiCaprio', hasOscar: true},
    });

    await client.update({
      index: 'files-alias',
      id: 'some-file-20',
      body: {
        script: painlessScript,
      },
      refresh: true,
    });

    const updatedDoc = await client.get({
      index: 'files-alias',
      id: 'some-file-20',
    });

    expect(updatedDoc._source).toEqual({
      actors: [
        {
          hasOscar: true,
          id: 'actor-id-1',
          name: 'Leonardo DiCaprio',
        },
      ],
      name: 'Wolf from wall street',
    });
  });

  it('should not update object in array if it exists and has no fields to update', async () => {
    await client.create({
      index: 'files-alias',
      id: 'some-file-21',
      body: {
        name: 'Wolf from wall street',
        actors: [{id: 'actor-id-1'}],
      },
      refresh: true,
    });

    const painlessScript = painlessFields.updateObjectInArray({
      arrayFieldName: 'actors',
      targetObject: {fieldName: 'id', fieldValue: 'actor-id-1'},
      fieldsToUpdate: {name: 'Leonardo DiCaprio', hasOscar: true},
    });

    await client.update({
      index: 'files-alias',
      id: 'some-file-21',
      body: {
        script: painlessScript,
      },
      refresh: true,
    });

    const updatedDoc = await client.get({
      index: 'files-alias',
      id: 'some-file-21',
    });

    expect(updatedDoc._source).toEqual({
      actors: [
        {
          id: 'actor-id-1',
        },
      ],
      name: 'Wolf from wall street',
    });
  });

  it('should not update object in array if object does not exist in array', async () => {
    await client.create({
      index: 'files-alias',
      id: 'some-file-22',
      body: {
        name: 'Wolf from wall street',
        actors: [
          {
            id: 'actor-id-2',
          },
        ],
      },
      refresh: true,
    });

    const painlessScript = painlessFields.updateObjectInArray({
      arrayFieldName: 'actors',
      targetObject: {fieldName: 'id', fieldValue: 'actor-id-1'},
      fieldsToUpdate: {name: 'Leonardo DiCaprio', hasOscar: true},
    });

    await client.update({
      index: 'files-alias',
      id: 'some-file-22',
      body: {
        script: painlessScript,
      },
      refresh: true,
    });

    const updatedDoc = await client.get({
      index: 'files-alias',
      id: 'some-file-22',
    });

    expect(updatedDoc._source).toEqual({
      actors: [
        {
          id: 'actor-id-2',
        },
      ],
      name: 'Wolf from wall street',
    });
  });

  it('should update object in array if it exists and has fields to update and arrayFieldName is nested', async () => {
    await client.create({
      index: 'files-alias',
      id: 'some-file-23',
      body: {
        name: 'Wolf from wall street',
        data: {
          film: {
            actors: [{id: 'actor-id-1', name: 'Leonardo Dicaprio', hasOscar: false}],
          },
        },
      },
      refresh: true,
    });

    const painlessScript = painlessFields.updateObjectInArray({
      arrayFieldName: 'data.film.actors',
      targetObject: {fieldName: 'id', fieldValue: 'actor-id-1'},
      fieldsToUpdate: {name: 'Leonardo DiCaprio', hasOscar: true},
    });

    await client.update({
      index: 'files-alias',
      id: 'some-file-23',
      body: {
        script: painlessScript,
      },
      refresh: true,
    });

    const updatedDoc = await client.get({
      index: 'files-alias',
      id: 'some-file-23',
    });

    expect(updatedDoc._source).toEqual({
      data: {
        film: {
          actors: [
            {
              hasOscar: true,
              id: 'actor-id-1',
              name: 'Leonardo DiCaprio',
            },
          ],
        },
      },
      name: 'Wolf from wall street',
    });
  });
});
