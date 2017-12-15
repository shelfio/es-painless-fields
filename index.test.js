const m = require('.');

it('should export a set function', () => {
  expect(m.set).toBeInstanceOf(Function);
});

it('should return script to set 2 simple fields', () => {
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
