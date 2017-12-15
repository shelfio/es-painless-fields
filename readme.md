# es-painless-fields [![Build Status](https://travis-ci.org/vladgolubev/es-painless-fields.svg?branch=master)](https://travis-ci.org/vladgolubev/es-painless-fields)

> Generate Painless Elasticsearch script to set / unset fields on document from JavaScript Object

## Install

```
$ yarn add es-painless-fields
```

## Usage

```js
const esPainlessFields = require('es-painless-fields');

esPainlessFields('unicorns');
//=> 'unicorns & rainbows'
```

## API

### esPainlessFields(input, [options])

#### input

Type: `string`

Lorem ipsum.

#### options

##### foo

Type: `boolean`<br>
Default: `false`

Lorem ipsum.

## License

MIT © [Vlad Holubiev](https://vladholubiev.com)
