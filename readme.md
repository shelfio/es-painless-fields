# es-painless-fields [![Build Status](https://travis-ci.org/vladgolubev/es-painless-fields.svg?branch=master)](https://travis-ci.org/vladgolubev/es-painless-fields)

> Generate Painless Elasticsearch script to set / unset fields on document from JavaScript Object

## Install

```
$ yarn add es-painless-fields
```

## Usage

```js
const esPainlessFields = require('es-painless-fields');

esPainlessFields.set({a: 1, b: 2});

/*
  {
    "script": {
      "lang": "painless",
      "source": "ctx._source.a = params.a; ctx._source.b = params.b;",
      "params": {
        "a": 1,
        "b": 2
      }
    }
  }
 */
```

## API

### esPainlessFields.set(fieldsMap)

#### fieldsMap

Type: `Object`

Object fields which you would like to set.

## License

MIT © [Vlad Holubiev](https://vladholubiev.com)
