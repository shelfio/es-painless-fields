import m from './index';

describe('#set', () => {
  it('should export a set function', () => {
    expect(m.set).toBeInstanceOf(Function);
  });

  it('should handle empty input', () => {
    const fieldsMap = {};
    const result = m.set(fieldsMap);

    expect(result).toEqual({
      lang: 'painless',
      source: '',
      params: {},
    });
  });

  it('should return a script to set 2 simple fields', () => {
    const fieldsMap = {
      a: 1,
      b: 2,
    };
    const result = m.set(fieldsMap);

    expect(result).toEqual({
      lang: 'painless',
      source: 'ctx._source.a = params.a; ctx._source.b = params.b;',
      params: {
        a: 1,
        b: 2,
      },
    });
  });

  it('should unflatten flat nested objects from params', () => {
    const fieldsMap = {
      'a.b.c': 1,
    };
    const result = m.set(fieldsMap);

    expect(result).toEqual({
      lang: 'painless',
      source: 'ctx._source.a.b.c = params.a.b.c;',
      params: {
        a: {
          b: {
            c: 1,
          },
        },
      },
    });
  });

  it('should work with hyphens', () => {
    const fieldsMap = {};

    fieldsMap['first-name'] = 'John';
    fieldsMap['last-name'] = 'Doe';

    const result = m.setNotFlattened(fieldsMap);

    expect(result).toEqual({
      lang: 'painless',
      source: `ctx._source['first-name'] = params['first-name']; ctx._source['last-name'] = params['last-name'];`,
      params: {
        'first-name': 'John',
        'last-name': 'Doe',
      },
    });
  });

  it('should assert subobjects with safe mode', () => {
    const fieldsMap = {
      'first-name': 'John',
      'last-name': 'Doe',
      metadata: {
        paying: true,
      },
    };

    const result = m.setNotFlattened(fieldsMap, true);

    expect(result).toEqual({
      lang: 'painless',
      source: `if (ctx._source['metadata'] == null) { ctx._source['metadata'] = [:] }ctx._source['first-name'] = params['first-name']; ctx._source['last-name'] = params['last-name']; ctx._source['metadata']['paying'] = params['metadata']['paying'];`,
      params: {
        'first-name': 'John',
        'last-name': 'Doe',
        metadata: {
          paying: true,
        },
      },
    });
  });
});

describe('#setNotFlattened', () => {
  it('should export a setNotFlattened function', () => {
    expect(m.setNotFlattened).toBeInstanceOf(Function);
  });

  it('should return script to set items from nested object', () => {
    const fieldsMap = {
      id: 'film-id-1',
      name: 'titanic',
      meta: {
        year: 1997,
        hasOscar: true,
        actors: [{name: 'Kate Winslet'}, {name: 'Leonardo DiCaprio'}],
        extra: {
          rating: 9.1,
        },
      },
    };
    const result = m.setNotFlattened(fieldsMap);

    expect(result).toEqual({
      lang: 'painless',
      params: {
        id: 'film-id-1',
        meta: {
          actors: [
            {
              name: 'Kate Winslet',
            },
            {
              name: 'Leonardo DiCaprio',
            },
          ],
          extra: {
            rating: 9.1,
          },
          hasOscar: true,
          year: 1997,
        },
        name: 'titanic',
      },
      source: `ctx._source['id'] = params['id']; ctx._source['name'] = params['name']; ctx._source['meta']['year'] = params['meta']['year']; ctx._source['meta']['hasOscar'] = params['meta']['hasOscar']; ctx._source['meta']['actors'] = params['meta']['actors']; ctx._source['meta']['extra']['rating'] = params['meta']['extra']['rating'];`,
    });
  });
});

describe('#unset', () => {
  it('should export an unset function', () => {
    expect(m.unset).toBeInstanceOf(Function);
  });

  it('should handle empty input', () => {
    const result = m.unset([]);

    expect(result).toEqual({
      lang: 'painless',
      source: '',
    });
  });

  it('should return a script to unset 2 simple fields', () => {
    const result = m.unset(['a', 'b']);

    expect(result).toEqual({
      lang: 'painless',
      source: `ctx._source.remove('a'); ctx._source.remove('b')`,
    });
  });

  it('should unflatten flat nested objects from params', () => {
    const result = m.unset(['a.b.c']);

    expect(result).toEqual({
      lang: 'painless',
      source: `ctx._source.remove('a.b.c')`,
    });
  });
});

describe('#replace', () => {
  it('should export a replace function', () => {
    expect(m.replace).toBeInstanceOf(Function);
  });

  it('should handle empty input', () => {
    const fieldsReplacements = [];
    const result = m.replace(fieldsReplacements);

    expect(result).toEqual({
      lang: 'painless',
      source: '',
      params: {
        patterns: [],
        substrings: [],
      },
    });
  });

  it('should return a script to replace 2 fields by pattern', () => {
    const fieldsReplacements = [
      {field: 'a', pattern: 'foo', substring: 'bar'},
      {field: 'b', pattern: 'hello', substring: 'world'},
    ];
    const result = m.replace(fieldsReplacements);

    expect(result).toEqual({
      lang: 'painless',
      source:
        'ctx._source.a = ctx._source.a.replace(params.patterns[0], params.substrings[0]); ctx._source.b = ctx._source.b.replace(params.patterns[1], params.substrings[1]);',
      params: {
        patterns: ['foo', 'hello'],
        substrings: ['bar', 'world'],
      },
    });
  });
});

describe('#replaceSubArray', () => {
  it('should export a replaceSubArray function', () => {
    expect(m.replaceSubArray).toBeInstanceOf(Function);
  });

  it('should handle empty input', () => {
    const fieldsReplacements = [];
    const result = m.replaceSubArray(fieldsReplacements);

    expect(result).toEqual({
      lang: 'painless',
      source: '',
      params: {
        subArrays: [],
        newArrays: [],
      },
    });
  });

  it('should return a script to replaceSubArray in 2 fields by old subArray with newArray', () => {
    const fieldsReplacements = [
      {field: 'a', subArray: ['1', '2'], newArray: ['10', '20']},
      {field: 'b', subArray: ['3', '4'], newArray: ['30', '40']},
    ];
    const result = m.replaceSubArray(fieldsReplacements);

    expect(result).toEqual({
      lang: 'painless',
      params: {
        newArrays: [
          ['10', '20'],
          ['30', '40'],
        ],
        subArrays: [
          ['1', '2'],
          ['3', '4'],
        ],
      },
      source:
        'for (int j=0;j<params.subArrays[0].length;j++) { if (ctx._source.a.contains(params.subArrays[0][j])) { ctx._source.a.remove(ctx._source.a.indexOf(params.subArrays[0][j])); } } ctx._source.a.addAll(params.newArrays[0]); ctx._source.a = ctx._source.a.stream().distinct().collect(Collectors.toList()); for (int j=0;j<params.subArrays[1].length;j++) { if (ctx._source.b.contains(params.subArrays[1][j])) { ctx._source.b.remove(ctx._source.b.indexOf(params.subArrays[1][j])); } } ctx._source.b.addAll(params.newArrays[1]); ctx._source.b = ctx._source.b.stream().distinct().collect(Collectors.toList());',
    });
  });
});

describe('#removeFromArray', () => {
  it('should export a removeFromArray function', () => {
    expect(m.removeFromArray).toBeInstanceOf(Function);
  });

  it('should handle empty input', () => {
    const fieldsReplacements = [];
    const result = m.removeFromArray(fieldsReplacements);

    expect(result).toEqual({
      lang: 'painless',
      source: '',
      params: {
        itemsToRemoveArrays: [],
      },
    });
  });

  it('should return a script to removeFromArray in 2 fields by old subArray', () => {
    const fieldsReplacements = [
      {field: 'a', itemsToRemove: ['1', '2']},
      {field: 'b', itemsToRemove: ['3', '4']},
    ];
    const result = m.removeFromArray(fieldsReplacements);

    expect(result).toEqual({
      lang: 'painless',
      params: {
        itemsToRemoveArrays: [
          ['1', '2'],
          ['3', '4'],
        ],
      },
      source:
        'for (int j=0;j<params.itemsToRemoveArrays[0].length;j++) { if (ctx._source.a.contains(params.itemsToRemoveArrays[0][j])) { ctx._source.a.remove(ctx._source.a.indexOf(params.itemsToRemoveArrays[0][j])); } } for (int j=0;j<params.itemsToRemoveArrays[1].length;j++) { if (ctx._source.b.contains(params.itemsToRemoveArrays[1][j])) { ctx._source.b.remove(ctx._source.b.indexOf(params.itemsToRemoveArrays[1][j])); } }',
    });
  });
});

describe('#increment', () => {
  it('should export a increment function', () => {
    expect(m.increment).toBeInstanceOf(Function);
  });

  it('should handle empty input', () => {
    const fieldsMap = {};
    const result = m.increment(fieldsMap);

    expect(result).toEqual({
      lang: 'painless',
      source: '',
      params: {},
    });
  });

  it('should return a script to increment 2 simple fields', () => {
    const fieldsMap = {
      a: 1,
      b: 2,
    };
    const result = m.increment(fieldsMap);

    expect(result).toEqual({
      lang: 'painless',
      params: {_inc: {a: 1, b: 2}},
      source:
        'if (ctx._source.a == null) { ctx._source.a = params._inc.a; } else { ctx._source.a += params._inc.a; } if (ctx._source.b == null) { ctx._source.b = params._inc.b; } else { ctx._source.b += params._inc.b; }',
    });
  });

  it('should unflatten flat nested objects from params', () => {
    const fieldsMap = {
      'a.b.c': 1,
    };
    const result = m.increment(fieldsMap);

    expect(result).toEqual({
      lang: 'painless',
      params: {_inc: {a: {b: {c: 1}}}},
      source:
        'if (ctx._source.a.b.c == null) { ctx._source.a.b.c = params._inc.a.b.c; } else { ctx._source.a.b.c += params._inc.a.b.c; }',
    });
  });
});

describe('#decrement', () => {
  it('should export a decrement function', () => {
    expect(m.decrement).toBeInstanceOf(Function);
  });

  it('should handle empty input', () => {
    const fieldsMap = {};
    const result = m.decrement(fieldsMap);

    expect(result).toEqual({
      lang: 'painless',
      source: '',
      params: {},
    });
  });

  it('should return a script to decrement 2 simple fields', () => {
    const fieldsMap = {
      a: 1,
      b: 2,
    };
    const result = m.decrement(fieldsMap);

    expect(result).toEqual({
      lang: 'painless',
      params: {_dec: {a: 1, b: 2}},
      source:
        'if (ctx._source.a == null) { ctx._source.a = 0; } else { ctx._source.a -= params._dec.a; } if (ctx._source.b == null) { ctx._source.b = 0; } else { ctx._source.b -= params._dec.b; }',
    });
  });

  it('should unflatten flat nested objects from params', () => {
    const fieldsMap = {
      'a.b.c': 1,
    };
    const result = m.decrement(fieldsMap);

    expect(result).toEqual({
      lang: 'painless',
      params: {_dec: {a: {b: {c: 1}}}},
      source:
        'if (ctx._source.a.b.c == null) { ctx._source.a.b.c = 0; } else { ctx._source.a.b.c -= params._dec.a.b.c; }',
    });
  });
});

describe('#multiply', () => {
  it('should export a multiply function', () => {
    expect(m.multiply).toBeInstanceOf(Function);
  });

  it('should handle empty input', () => {
    const fieldsMap = {};
    const result = m.multiply(fieldsMap);

    expect(result).toEqual({
      lang: 'painless',
      source: '',
      params: {},
    });
  });

  it('should return a script to multiply 2 simple fields', () => {
    const fieldsMap = {
      a: 1,
      b: 2,
    };
    const result = m.multiply(fieldsMap);

    expect(result).toEqual({
      lang: 'painless',
      params: {_mul: {a: 1, b: 2}},
      source:
        'if (ctx._source.a == null) { ctx._source.a = 0; } else { ctx._source.a *= params._mul.a; } if (ctx._source.b == null) { ctx._source.b = 0; } else { ctx._source.b *= params._mul.b; }',
    });
  });

  it('should unflatten flat nested objects from params', () => {
    const fieldsMap = {
      'a.b.c': 1,
    };
    const result = m.multiply(fieldsMap);

    expect(result).toEqual({
      lang: 'painless',
      params: {_mul: {a: {b: {c: 1}}}},
      source:
        'if (ctx._source.a.b.c == null) { ctx._source.a.b.c = 0; } else { ctx._source.a.b.c *= params._mul.a.b.c; }',
    });
  });
});

describe('#divide', () => {
  it('should export a divide function', () => {
    expect(m.divide).toBeInstanceOf(Function);
  });

  it('should handle empty input', () => {
    const fieldsMap = {};
    const result = m.divide(fieldsMap);

    expect(result).toEqual({
      lang: 'painless',
      source: '',
      params: {},
    });
  });

  it('should return a script to divide 2 simple fields', () => {
    const fieldsMap = {
      a: 1,
      b: 2,
    };
    const result = m.divide(fieldsMap);

    expect(result).toEqual({
      lang: 'painless',
      params: {_div: {a: 1, b: 2}},
      source:
        'if (ctx._source.a == null) { ctx._source.a = 0; } else { ctx._source.a /= params._div.a; } if (ctx._source.b == null) { ctx._source.b = 0; } else { ctx._source.b /= params._div.b; }',
    });
  });

  it('should unflatten flat nested objects from params', () => {
    const fieldsMap = {
      'a.b.c': 1,
    };
    const result = m.divide(fieldsMap);

    expect(result).toEqual({
      lang: 'painless',
      params: {_div: {a: {b: {c: 1}}}},
      source:
        'if (ctx._source.a.b.c == null) { ctx._source.a.b.c = 0; } else { ctx._source.a.b.c /= params._div.a.b.c; }',
    });
  });
});

describe('#updateObjectInArray', () => {
  it('should export updateObjectInArray function', () => {
    expect(m.updateObjectInArray).toBeInstanceOf(Function);
  });

  it('should return a script to update object in array', () => {
    const result = m.updateObjectInArray({
      arrayFieldName: 'actors',
      targetObject: {fieldName: 'id', fieldValue: 'actor-id-1'},
      fieldsToUpdate: {name: 'Leonardo DiCaprio', hasOscar: true},
    });

    expect(result).toEqual({
      lang: 'painless',
      params: {
        fieldsToUpdate: {
          hasOscar: true,
          name: 'Leonardo DiCaprio',
        },
        targetObject: {
          fieldName: 'id',
          fieldValue: 'actor-id-1',
        },
      },
      source:
        'if (ctx._source.actors != null) { def target = ctx._source.actors.find(objectInArray -> objectInArray[params.targetObject.fieldName] == params.targetObject.fieldValue); if (target != null) { for (key in params.fieldsToUpdate.keySet()) { def value = params.fieldsToUpdate[key]; if (target[key] != value) { target[key] = value; } } } }',
    });
  });
});

describe('#upsertObjectInArray', () => {
  it('should export a upsertObjectInArray function', () => {
    expect(m.upsertObjectInArray).toBeInstanceOf(Function);
  });

  it('should return a script to upsert object in array', () => {
    const result = m.upsertObjectInArray({
      arrayFieldName: 'actors',
      targetObject: {fieldName: 'id', fieldValue: 'actor-id-1'},
      fieldsToUpsert: {name: 'Margot Robbie', sex: 'female'},
    });

    expect(result).toEqual({
      lang: 'painless',
      params: {
        fieldsToUpsert: {
          name: 'Margot Robbie',
          sex: 'female',
        },
        targetObject: {
          fieldName: 'id',
          fieldValue: 'actor-id-1',
        },
      },
      source:
        'if (ctx._source.actors == null) { ctx._source.actors = []; } def target = ctx._source.actors.find(objectInArray -> objectInArray[params.targetObject.fieldName] == params.targetObject.fieldValue); if (target == null) { ctx._source.actors.add(params.fieldsToUpsert); } else { for (key in params.fieldsToUpsert.keySet()) { def value = params.fieldsToUpsert[key]; if (target[key] != value) { target[key] = value; } } }',
    });
  });
});

describe('#removeObjectFromArray', () => {
  it('should export removeObjectFromArray function', () => {
    expect(m.removeObjectFromArray).toBeInstanceOf(Function);
  });

  it('should return a script to remove object from array', () => {
    const result = m.removeObjectFromArray({
      arrayFieldName: 'actors',
      targetObject: {fieldName: 'id', fieldValue: 'actor-id-1'},
    });

    expect(result).toEqual({
      lang: 'painless',
      params: {
        targetObject: {
          fieldName: 'id',
          fieldValue: 'actor-id-1',
        },
      },
      source:
        'if (ctx._source.actors != null) { ctx._source.actors.removeIf(objectInArray -> objectInArray[params.targetObject.fieldName] == params.targetObject.fieldValue); }',
    });
  });
});
