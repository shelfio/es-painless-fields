# es-painless-fields ![CircleCI](https://img.shields.io/circleci/project/github/shelfio/es-painless-fields.svg) ![](https://img.shields.io/badge/code_style-prettier-ff69b4.svg) ![node](https://img.shields.io/node/v/es-painless-fields.svg)

> Helpers for bulk update Elasticsearch documents by query using Painless scripts

## Install

```
$ yarn add @shelf/es-painless-fields
```

## Features & Motivation

The main purpose is to utilize `_update_by_query` Elasticsearch API most efficiently. API is limited to updating
documents in-place by scripts, so you cannot rely on ES to replace document by passing partial parameters. This package
aims to ease partial bulk document updates.

- In-place **set** values to fields
- In-place **unset** values to fields
- In-place **replace** values in fields
- In-place **increment** values in fields
- In-place **decrement** values in fields
- In-place **multiply** values in fields
- In-place **divide** values in fields
- ... to be done

## Usage

```js
const esClient = require('elasticsearch').Client();
const painlessFields = require('@shelf/es-painless-fields');

const script = painlessFields.set({a: 1, b: 2});

esClient.updateByQuery({
  conflicts: 'proceed',
  body: {
    query: {match_all: {}},
    script,
  },
});
```

## API

### .set(fieldsMap)

#### fieldsMap

Type: `Object`

Object fields which you would like to set. Example: `{a: 1, b: 2}`

Also can be in a flat form, like `{'a.b.c': 1}`

### .unset(fields)

#### fields

Type: `String[]`

Array of field names which you would like to unset. Example: `['a', 'b'']`

### .increment(fieldsMap)

This library will handle the case if property did not yet exist. It will set the value to the incremented count.

#### fieldsMap

Type: `Object`

Object fields which you would like to increment. Example: `{a: 1, b: 2}`

Also, can be in a flat form, like `{'a.b.c': 1}`

### .decrement(fieldsMap)

It will fallback to setting property value to 0 if it didn't exist yet.

#### fieldsMap

Type: `Object`

Object fields which you would like to decrement. Example: `{a: 1, b: 2}`

Also can be in a flat form, like `{'a.b.c': 1}`

### .multiply(fieldsMap)

It will fallback to setting property value to 0 if it didn't exist yet.

#### fieldsMap

Type: `Object`

Object fields which you would like to multiply. Example: `{a: 1, b: 2}`

Also can be in a flat form, like `{'a.b.c': 1}`

### .divide(fieldsMap)

It will fallback to setting property value to 0 if it didn't exist yet.

#### fieldsMap

Type: `Object`

Object fields which you would like to divide. Example: `{a: 1, b: 2}`

Also can be in a flat form, like `{'a.b.c': 1}`

### .replace(fieldsReplacements)

#### fieldsReplacements

Type: `Array`

Array of objects describing what to replace. Example:

```js
const fieldsReplacements = [
  {field: 'a', pattern: 'foo', substring: 'bar'},
  {field: 'b', pattern: 'hello', substring: 'world'},
];
```

Returns a script which replaces fields by pattern with substrings. Example:

```json
{
  "lang": "painless",
  "source": "ctx._source.a = ctx._source.a.replace(params.patterns[0], params.substrings[0]); ctx._source.b = ctx._source.b.replace(params.patterns[1], params.substrings[1]);",
  "params": {
    "patterns": ["foo", "hello"],
    "substrings": ["bar", "world"]
  }
}
```

### .replaceSubArray(fieldsReplacements)

#### fieldsReplacements

Type: `Array`

Array of objects describing what subarray to replace with new array. Example:

```js
const fieldsReplacements = [
  {field: 'a', subArray: ['1', '2'], newArray: ['10', '20']},
  {field: 'b', subArray: ['3', '4'], newArray: ['30', '40']},
];
```

Returns a script which replaces fields by old subarray with new array. Example:

```json
{
  "lang": "painless",
  "source": "for (int j=0;j<params.subArrays[0].length;j++) { if (ctx._source.a.contains(params.subArrays[0][j])) { ctx._source.a.remove(ctx._source.a.indexOf(params.subArrays[0][j])); } } ctx._source.a.addAll(params.newArrays[0]);  for (int j=0;j<params.subArrays[1].length;j++) { if (ctx._source.b.contains(params.subArrays[1][j])) { ctx._source.b.remove(ctx._source.b.indexOf(params.subArrays[1][j])); } } ctx._source.b.addAll(params.newArrays[1]); ",
  "params": {
    "subArrays": [
      ["1", "2"],
      ["3", "4"]
    ],
    "substrings": [
      ["10", "20"],
      ["30", "40"]
    ]
  }
}
```

### .removeFromArray(fieldsReplacements)

#### fieldsReplacements

Type: `Array`

Array of objects describing what items to remove from which array. Example:

```js
const fieldsReplacements = [
  {field: 'a', itemsToRemove: ['1', '2']},
  {field: 'b', itemsToRemove: ['3', '4']},
];
```

Returns a script which removes items from array. Example:

```json
{
  "lang": "painless",
  "params": {
    "itemsToRemoveArrays": [
      ["1", "2"],
      ["3", "4"]
    ]
  },
  "source": "for (int j=0;j<params.itemsToRemoveArrays[0].length;j++) { if (ctx._source.a.contains(params.itemsToRemoveArrays[0][j])) { ctx._source.a.remove(ctx._source.a.indexOf(params.itemsToRemoveArrays[0][j])); } } for (int j=0;j<params.itemsToRemoveArrays[1].length;j++) { if (ctx._source.b.contains(params.itemsToRemoveArrays[1][j])) { ctx._source.b.remove(ctx._source.b.indexOf(params.itemsToRemoveArrays[1][j])); } }"
}
```

## Publish

```sh
$ git checkout master
$ yarn version
$ yarn publish
$ git push origin master --tags
```

## License

MIT © [Shelf](https://shelf.io)
