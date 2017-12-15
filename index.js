'use strict';

module.exports = {
  set(fieldsMap) {
    const source = Object.keys(fieldsMap)
      .map(key => `ctx._source.${key} = params.${key};`)
      .join(' ');

    return {
      lang: 'painless',
      source,
      params: fieldsMap
    }
  }
};
