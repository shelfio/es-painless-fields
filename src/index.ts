import {flatten, unflatten} from 'flat';

type PainlessScript = {
  lang: 'painless';
  source: string;
  params?: Record<string, unknown>;
};

const BRACKET_NOTATION_REGEX = /\.\[/gm;
const INLINE_SCRIPT_REGEX = /\n\s{1,}/g;
const BRACKETS_SPLIT_REGEX = /\['[^[\]]*'\]/gm;

const main = {
  set(fieldsMap: Record<string, unknown> = {}): PainlessScript {
    const source = Object.keys(fieldsMap)
      .map(key => `ctx._source.${key} = params.${key};`)
      .join(' ');

    return {
      lang: 'painless',
      source,
      params: unflatten(fieldsMap),
    };
  },

  setNotFlattened(fieldsMap: Record<string, unknown> = {}, safe?: boolean): PainlessScript {
    const flatFieldsMap: Record<string, unknown> = flatten(fieldsMap, {
      safe: true,
      transformKey: key => `['${key}']`,
    });

    const brackets = Object.keys(flatFieldsMap).map(convertToBracketNotation);

    let prefix = '';

    if (safe) {
      prefix = assertNullKeys(brackets);
    }

    const source =
      prefix + brackets.map(bracket => `ctx._source${bracket} = params${bracket};`).join(' ');

    return {
      lang: 'painless',
      source,
      params: fieldsMap,
    };
  },

  unset(fields: string[] = []): PainlessScript {
    const source = fields.map(key => `ctx._source.remove('${key}')`).join('; ');

    return {
      lang: 'painless',
      source,
    };
  },

  replace(
    fieldsReplacements: {
      field: string;
      pattern: string;
      substring: string;
    }[] = []
  ): PainlessScript {
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
        substrings: fieldsReplacements.map(i => i.substring),
      },
    };
  },

  replaceSubArray(
    fieldsReplacements: {
      field: string;
      subArray: string[];
      newArray: string[];
    }[] = []
  ): PainlessScript {
    const source = fieldsReplacements
      .map((replaceRule, i) => {
        const sourceField = `ctx._source.${replaceRule.field}`;
        const subArray = `params.subArrays[${i}]`;
        const newArray = `params.newArrays[${i}]`;

        return convertMultilineScriptToInline(`
                for (int j=0;j<${subArray}.length;j++) {
                  if (${sourceField}.contains(${subArray}[j])) {
                      ${sourceField}.remove(${sourceField}.indexOf(${subArray}[j]));
                  }
                }

                ${sourceField}.addAll(${newArray}); ${sourceField} = ${sourceField}.stream().distinct().collect(Collectors.toList());`);
      })
      .join(' ');

    return {
      lang: 'painless',
      source,
      params: {
        subArrays: fieldsReplacements.map(i => i.subArray),
        newArrays: fieldsReplacements.map(i => i.newArray),
      },
    };
  },

  removeFromArray(
    fieldsReplacements: {
      field: string;
      itemsToRemove: string[];
    }[] = []
  ): PainlessScript {
    const source = fieldsReplacements
      .map((replaceRule, i) => {
        const sourceField = `ctx._source.${replaceRule.field}`;
        const itemsToRemove = `params.itemsToRemoveArrays[${i}]`;

        return convertMultilineScriptToInline(`
                for (int j=0;j<${itemsToRemove}.length;j++) {
                  if (${sourceField}.contains(${itemsToRemove}[j])) {
                      ${sourceField}.remove(${sourceField}.indexOf(${itemsToRemove}[j]));
                  }
                }`);
      })
      .join(' ');

    return {
      lang: 'painless',
      source,
      params: {
        itemsToRemoveArrays: fieldsReplacements.map(i => i.itemsToRemove),
      },
    };
  },

  increment(fieldsMap: Record<string, unknown> = {}): PainlessScript {
    const source = Object.keys(fieldsMap)
      .map(key =>
        convertMultilineScriptToInline(`
          if (ctx._source.${key} == null) {
            ctx._source.${key} = params._inc.${key};
          } else {
            ctx._source.${key} += params._inc.${key};
          }
      `)
      )
      .join(' ');

    return {
      lang: 'painless',
      source,
      params: source ? {_inc: unflatten(fieldsMap)} : {},
    };
  },

  decrement(fieldsMap: Record<string, unknown> = {}): PainlessScript {
    const source = Object.keys(fieldsMap)
      .map(key =>
        convertMultilineScriptToInline(`
          if (ctx._source.${key} == null) {
            ctx._source.${key} = 0;
          } else {
            ctx._source.${key} -= params._dec.${key};
          }
      `)
      )
      .join(' ');

    return {
      lang: 'painless',
      source,
      params: source ? {_dec: unflatten(fieldsMap)} : {},
    };
  },

  multiply(fieldsMap: Record<string, unknown> = {}): PainlessScript {
    const source = Object.keys(fieldsMap)
      .map(key =>
        convertMultilineScriptToInline(`
          if (ctx._source.${key} == null) {
            ctx._source.${key} = 0;
          } else {
            ctx._source.${key} *= params._mul.${key};
          }
      `)
      )
      .join(' ');

    return {
      lang: 'painless',
      source,
      params: source ? {_mul: unflatten(fieldsMap)} : {},
    };
  },

  divide(fieldsMap: Record<string, unknown> = {}): PainlessScript {
    const source = Object.keys(fieldsMap)
      .map(key =>
        convertMultilineScriptToInline(`
          if (ctx._source.${key} == null) {
            ctx._source.${key} = 0;
          } else {
            ctx._source.${key} /= params._div.${key};
          }
      `)
      )
      .join(' ');

    return {
      lang: 'painless',
      source,
      params: source ? {_div: unflatten(fieldsMap)} : {},
    };
  },

  updateObjectInArray(updateObjectInArrayParams: {
    arrayFieldName: string;
    targetObject: {fieldName: string; fieldValue: unknown};
    fieldsToUpdate: Record<string, unknown>;
  }): PainlessScript {
    const {arrayFieldName, targetObject, fieldsToUpdate} = updateObjectInArrayParams;
    const sourceArrayField = `ctx._source.${arrayFieldName}`;

    const source = convertMultilineScriptToInline(`
      if (${sourceArrayField} != null) {
        def target = ${sourceArrayField}.find(objectInArray -> objectInArray[params.targetObject.fieldName] == params.targetObject.fieldValue);

        if (target != null) {
          for (key in params.fieldsToUpdate.keySet()) {
            def value = params.fieldsToUpdate[key];

            if (target[key] != null && target[key] != value) {
              target[key] = value;
            }
          }
        }
      }
    `);

    return {
      lang: 'painless',
      source,
      params: {
        targetObject,
        fieldsToUpdate,
      },
    };
  },

  upsertObjectInArray(upsertObjectInArrayParams: {
    arrayFieldName: string;
    targetObject: {fieldName: string; fieldValue: unknown};
    fieldsToUpsert: Record<string, unknown>;
  }): PainlessScript {
    const {arrayFieldName, targetObject, fieldsToUpsert} = upsertObjectInArrayParams;
    const sourceArrayField = `ctx._source.${arrayFieldName}`;

    const source = convertMultilineScriptToInline(`
      if (${sourceArrayField} == null) {
        ${sourceArrayField} = [];
      }

      def target = ${sourceArrayField}.find(objectInArray -> objectInArray[params.targetObject.fieldName] == params.targetObject.fieldValue);

      if (target == null) {
        ${sourceArrayField}.add(params.fieldsToUpsert);
      } else {
        for (key in params.fieldsToUpsert.keySet()) {
          def value = params.fieldsToUpsert[key];

          if (target[key] != null && target[key] != value) {
            target[key] = value;
          }
        }
      }
  `);

    return {
      lang: 'painless',
      source,
      params: {
        targetObject,
        fieldsToUpsert,
      },
    };
  },

  removeObjectFromArray(removeObjectFromArrayParams: {
    arrayFieldName: string;
    targetObject: {fieldName: string; fieldValue: unknown};
  }): PainlessScript {
    const {arrayFieldName, targetObject} = removeObjectFromArrayParams;
    const sourceArrayField = `ctx._source.${arrayFieldName}`;

    const source = convertMultilineScriptToInline(`
      if (${sourceArrayField} != null) {
        ${sourceArrayField}.removeIf(objectInArray -> objectInArray[params.targetObject.fieldName] == params.targetObject.fieldValue);
      }
  `);

    return {
      lang: 'painless',
      source,
      params: {
        targetObject,
      },
    };
  },
};

function assertNullKeys(brackets: string[]): string {
  let result = '';

  for (const bracket of brackets) {
    const match = bracket.match(BRACKETS_SPLIT_REGEX);
    let assertKey = ``;

    if (!match) {
      continue;
    }

    for (let i = 0; i < match.length - 1; i++) {
      const currentMatch = match[i];

      assertKey += currentMatch;

      result += `if (ctx._source${assertKey} == null) {
        ctx._source${assertKey} = [:]
      }
      `;
    }
  }

  return convertMultilineScriptToInline(result);
}

function convertMultilineScriptToInline(script: string): string {
  return script.replace(INLINE_SCRIPT_REGEX, ' ').trim();
}

function convertToBracketNotation(key: string): string {
  return key.replace(BRACKET_NOTATION_REGEX, '[');
}

export default main;
