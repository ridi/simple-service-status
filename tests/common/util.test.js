/* global describe test expect beforeAll afterAll */

const util = require('../../src/common/common-util');

const snakeCaseArray = [
  { id: '1', nick_name: 'nick1', contacts: [{ contact_type: 'phone', value: '000-000-000' }, { contact_type: 'email', value: 'test@email.com' }] },
  { id: '2', nick_name: 'nick2', contacts: [] },
  { id: '3', nick_name: 'nick3', contacts: [{ contact_type: 'address', value: 'xxx' }] },
];

const camelCaseArray = [
  { id: '1', nickName: 'nick1', contacts: [{ contactType: 'phone', value: '000-000-000' }, { contactType: 'email', value: 'test@email.com' }] },
  { id: '2', nickName: 'nick2', contacts: [] },
  { id: '3', nickName: 'nick3', contacts: [{ contactType: 'address', value: 'xxx' }] },
];

const snakeCaseObject = {
  id: '1',
  nick_name: 'nick1',
  contacts: [{ contact_type: 'phone', value: '000-000-000' }, { contact_type: 'email', value: 'test@email.com' }],
};

const camelCaseObject = {
  id: '1',
  nickName: 'nick1',
  contacts: [{ contactType: 'phone', value: '000-000-000' }, { contactType: 'email', value: 'test@email.com' }],
};

test('snake2camel', () => {
  expect(util.snake2camel('snake_case_string')).toBe('snakeCaseString');
  expect(util.snake2camel('_snake_case_string')).toBe('snakeCaseString');
  expect(util.snake2camel('snake_case_string_')).toBe('snakeCaseString');
  expect(util.snake2camel('snake__case__string')).toBe('snakeCaseString');
  expect(util.snake2camel('this_is_1st')).toBe('thisIs1st');
});

test('camel2snake', () => {
  expect(util.camel2snake('camelCaseString')).toBe('camel_case_string');
  expect(util.camel2snake('SSString')).toBe('s_s_string');
  expect(util.camel2snake('1stNumberOccurrences')).toBe('1st_number_occurrences');
  expect(util.camel2snake('StartWithCapital')).toBe('start_with_capital');
  expect(util.camel2snake('numbersLike1AreIgnored')).toBe('numbers_like1_are_ignored');
});

test('snake2camelObject', () => {
  expect(util.snake2camelObject([])).toEqual([]);
  expect(util.snake2camelObject({})).toEqual({});
  expect(util.snake2camelObject(undefined)).toBe(undefined);
  expect(util.snake2camelObject(null)).toBe(null);
  expect(util.snake2camelObject(snakeCaseArray)).toEqual(camelCaseArray);
  expect(util.snake2camelObject(snakeCaseObject)).toEqual(camelCaseObject);
});

test('camel2snakeObject', () => {
  expect(util.camel2snakeObject([])).toEqual([]);
  expect(util.camel2snakeObject({})).toEqual({});
  expect(util.camel2snakeObject(undefined)).toBe(undefined);
  expect(util.camel2snakeObject(null)).toBe(null);
  expect(util.camel2snakeObject(camelCaseArray)).toEqual(snakeCaseArray);
  expect(util.camel2snakeObject(camelCaseObject)).toEqual(snakeCaseObject);
});
