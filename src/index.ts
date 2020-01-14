import {unflatten} from 'flat';

interface PainlessField {
  lang: string;
  source: string;
  params?: {};
}

export default {
  set(fieldsMap: object = {}): PainlessField {
    const source = Object.keys(fieldsMap)
      .map(key => `ctx._source.${key} = params.${key};`)
      .join(' ');

    return {
      lang: 'painless',
      source,
      params: unflatten(fieldsMap)
    };
  },

  unset(fields: string[] = []): PainlessField {
    const source = fields.map(key => `ctx._source.remove('${key}')`).join('; ');

    return {
      lang: 'painless',
      source
    };
  },

  replace(
    fieldsReplacements: {
      field: string;
      pattern: string;
      substring: string;
    }[] = []
  ): PainlessField {
    const source = fieldsReplacements
      .map((replaceRule, i) => {
        const sourceField = `ctx._source.${replaceRule.field}`;
        const pattern = `params.patterns[${i}]`;
        const substring = `params.substrings[${i}]`;

        return `${sourceField} = ${sourceField}.replace(${pattern}, ${substring});`;
      })
      .join(' ');

    return {
      lang: 'painless',
      source,
      params: {
        patterns: fieldsReplacements.map(i => i.pattern),
        substrings: fieldsReplacements.map(i => i.substring)
      }
    };
  },

  increment(fieldsMap: object = {}): PainlessField {
    const source = Object.keys(fieldsMap)
      .map(key => `ctx._source.${key} += params._inc.${key};`)
      .join(' ');

    return {
      lang: 'painless',
      source,
      params: source ? {_inc: unflatten(fieldsMap)} : {}
    };
  },

  decrement(fieldsMap: object = {}): PainlessField {
    const source = Object.keys(fieldsMap)
      .map(key => `ctx._source.${key} -= params._dec.${key};`)
      .join(' ');

    return {
      lang: 'painless',
      source,
      params: source ? {_dec: unflatten(fieldsMap)} : {}
    };
  },

  multiply(fieldsMap: object = {}): PainlessField {
    const source = Object.keys(fieldsMap)
      .map(key => `ctx._source.${key} *= params._mul.${key};`)
      .join(' ');

    return {
      lang: 'painless',
      source,
      params: source ? {_mul: unflatten(fieldsMap)} : {}
    };
  },

  divide(fieldsMap: object = {}): PainlessField {
    const source = Object.keys(fieldsMap)
      .map(key => `ctx._source.${key} /= params._div.${key};`)
      .join(' ');

    return {
      lang: 'painless',
      source,
      params: source ? {_div: unflatten(fieldsMap)} : {}
    };
  }
};
