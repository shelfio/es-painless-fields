const m = require('.');

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
      params: {}
    });
  });

  it('should return a script to set 2 simple fields', () => {
    const fieldsMap = {
      a: 1,
      b: 2
    };
    const result = m.set(fieldsMap);

    expect(result).toEqual({
      lang: 'painless',
      source: 'ctx._source.a = params.a; ctx._source.b = params.b;',
      params: {
        a: 1,
        b: 2
      }
    });
  });

  it('should unflatten flat nested objects from params', () => {
    const fieldsMap = {
      'a.b.c': 1
    };
    const result = m.set(fieldsMap);

    expect(result).toEqual({
      lang: 'painless',
      source: 'ctx._source.a.b.c = params.a.b.c;',
      params: {
        a: {
          b: {
            c: 1
          }
        }
      }
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
      source: ''
    });
  });

  it('should return a script to unset 2 simple fields', () => {
    const result = m.unset(['a', 'b']);

    expect(result).toEqual({
      lang: 'painless',
      source: `ctx._source.remove('a'); ctx._source.remove('b')`
    });
  });

  it('should unflatten flat nested objects from params', () => {
    const result = m.unset(['a.b.c']);

    expect(result).toEqual({
      lang: 'painless',
      source: `ctx._source.remove('a.b.c')`
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
        substrings: []
      }
    });
  });

  it('should return a script to replace 2 fields by pattern', () => {
    const fieldsReplacements = [
      {field: 'a', pattern: 'foo', substring: 'bar'},
      {field: 'b', pattern: 'hello', substring: 'world'}
    ];
    const result = m.replace(fieldsReplacements);

    expect(result).toEqual({
      lang: 'painless',
      source:
        'ctx._source.a = ctx._source.a.replace(params.patterns[0], params.substrings[0]); ctx._source.b = ctx._source.b.replace(params.patterns[1], params.substrings[1]);',
      params: {
        patterns: ['foo', 'hello'],
        substrings: ['bar', 'world']
      }
    });
  });
});
