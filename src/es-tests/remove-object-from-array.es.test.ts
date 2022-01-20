import {Client} from '@elastic/elasticsearch';
import painlessFields from '../index';

const client = new Client({node: process.env.ES_URL});

describe('#removeObjectFromArray', () => {
  it('should remove object from array if it exists', async () => {
    await client.create({
      index: 'files-alias',
      id: 'some-actor-40',
      body: {name: 'Wolf from wall street', actors: [{id: 'actor-id-1'}]},
      refresh: true,
    });

    const painlessScript = painlessFields.removeObjectFromArray({
      arrayFieldName: 'actors',
      targetObject: {fieldName: 'id', fieldValue: 'actor-id-1'},
    });

    await client.update({
      index: 'files-alias',
      id: 'some-actor-40',
      body: {
        script: painlessScript,
      },
      refresh: true,
    });

    const updatedDoc = await client.get({
      index: 'files-alias',
      id: 'some-actor-40',
    });

    expect(updatedDoc.body._source).toEqual({name: 'Wolf from wall street', actors: []});
  });

  it('should not remove object from array if it does not exist', async () => {
    await client.create({
      index: 'files-alias',
      id: 'some-actor-41',
      body: {name: 'Wolf from wall street', actors: [{id: 'actor-id-2'}]},
      refresh: true,
    });

    const painlessScript = painlessFields.removeObjectFromArray({
      arrayFieldName: 'actors',
      targetObject: {fieldName: 'id', fieldValue: 'actor-id-1'},
    });

    await client.update({
      index: 'files-alias',
      id: 'some-actor-41',
      body: {
        script: painlessScript,
      },
      refresh: true,
    });

    const updatedDoc = await client.get({
      index: 'files-alias',
      id: 'some-actor-41',
    });

    expect(updatedDoc.body._source).toEqual({
      name: 'Wolf from wall street',
      actors: [{id: 'actor-id-2'}],
    });
  });
});
