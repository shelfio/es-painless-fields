import {Client} from '@elastic/elasticsearch';
import painlessFields from './';

const client = new Client({node: process.env.ES_URL});

it('should increment views count in ES', async () => {
  await client.create({
    index: 'files-alias',
    id: 'some-file-1',
    body: {name: 'text.txt', viewsCount: 0},
    refresh: true,
  });

  const painlessScript = painlessFields.increment({viewsCount: 1});

  await client.update({
    index: 'files-alias',
    id: 'some-file-1',
    body: {
      script: painlessScript,
    },
    refresh: true,
  });

  const updatedDoc = await client.get({
    index: 'files-alias',
    id: 'some-file-1',
  });

  expect(updatedDoc.body._source).toEqual({name: 'text.txt', viewsCount: 1});
});

it('should increment views count in ES if property did not exist', async () => {
  await client.create({
    index: 'files-alias',
    id: 'some-file-2',
    body: {name: 'text.txt'},
    refresh: true,
  });

  const painlessScript = painlessFields.increment({viewsCount: 1});

  await client.update({
    index: 'files-alias',
    id: 'some-file-2',
    body: {
      script: painlessScript,
    },
    refresh: true,
  });

  const updatedDoc = await client.get({
    index: 'files-alias',
    id: 'some-file-2',
  });

  expect(updatedDoc.body._source).toEqual({name: 'text.txt', viewsCount: 1});
});
