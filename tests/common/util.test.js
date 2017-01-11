const util = require('../../src/common/util');

test('snake2camel', () => {
  expect(util.snake2camel('snake_case_string')).toBe('snakeCaseString');
  expect(util.snake2camel('_snake_case_string')).toBe('snakeCaseString');
  expect(util.snake2camel('snake_case_string_')).toBe('snakeCaseString_');
  expect(util.snake2camel('snake__case__string')).toBe('snake_Case_String');
  expect(util.snake2camel('this_is_1st')).toBe('thisIs1st');
});
