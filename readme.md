# es-painless-fields [![Build Status](https://travis-ci.org/vladgolubev/es-painless-fields.svg?branch=master)](https://travis-ci.org/vladgolubev/es-painless-fields) ![](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)

> Helpers for bulk update Elasticsearch documents by query using Painless scripts

## Install

```
$ yarn add es-painless-fields
```

## Features & Motivation

The main purpose is to utilize `_update_by_query` Elasticsearch API most efficiently.
API is limited to updating documents in-place by scripts, so you cannot rely on ES to replace document by passing partial parameters. This package aims to ease partial bulk document updates.

* In-place **set** values to fields
* In-place **replace** values in fields
* **Zero** dependencies!
* ... to be done

## Usage

```js
const esClient = require('elasticsearch').Client();
const painlessFields = require('es-painless-fields');

const script = painlessFields.set({a: 1, b: 2});

esClient.updateByQuery({
  conflicts: 'proceed',
  body: {
    query: {match_all: {}},
    script
  }
});

```

## API

### .set(fieldsMap)

#### fieldsMap

Type: `Object`

Object fields which you would like to set. Example: `{a: 1, b: 2}`

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

## License

MIT © [Vlad Holubiev](https://vladholubiev.com)
