const m = require('.');

it('should export a set function', () => {
	expect(m.set).toBeInstanceOf(Function);
});
