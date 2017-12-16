'use strict';

module.exports = {
  /**
   * Generates a script object which sets fields on the _source document
   * @param {Object} fieldsMap Object with fields to set
   * @return {{lang: string, source: string, params: *}} Painless Script Object
   */
  set(fieldsMap = {}) {
    const source = Object.keys(fieldsMap)
      .map(key => `ctx._source.${key} = params.${key};`)
      .join(' ');

    return {
      lang: 'painless',
      source,
      params: fieldsMap
    }
  },
  /**
   * Generates a script object which replaces fields on the _source document
   * @param {Object[]} fieldsReplacements Array of objects describing what to replace
   * @return {{lang: string, source: string, params: *}} Painless Script Object
   */
  replace(fieldsReplacements = []) {
    const source = fieldsReplacements.map((replaceRule, i) => {
      const sourceField = `ctx._source.${replaceRule.field}`;
      const pattern = `params.patterns[${i}]`;
      const substring = `params.substrings[${i}]`;

      return `${sourceField} = ${sourceField}.replace(${pattern}, ${substring});`
    }).join(' ');

    return {
      lang: 'painless',
      source,
      params: {
        patterns: fieldsReplacements.map(i => i.pattern),
        substrings: fieldsReplacements.map(i => i.substring)
      }
    }
  }
};
