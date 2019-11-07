import { pick, omitBy, pickBy, find, partialEqual } from './utils';

describe('utils test', () => {
  test('pick', () => {
    const obj = { a: 1, b: 2, c: 3 };
    let res = pick(obj, ['a']);
    expect(res).toEqual({ a: 1 });
    res = pick(obj, ['b', 'c']);
    expect(res).toEqual({ b: 2, c: 3 });
  });

  test('pickBy', () => {
    const obj = { a: 1, b: 2, c: 3 };
    let res = pickBy(obj, v => v === 2);
    expect(res).toEqual({ b: 2 });
    res = pickBy(obj, (_, k) => k === 'a');
    expect(res).toEqual({ a: 1 });
  });

  test('omitBy', () => {
    const obj = { a: 1, b: 2, c: 3 };
    let res = omitBy(obj, v => v === 2);
    expect(res).toEqual({ a: 1, c: 3 });
    res = omitBy(obj, (_, k) => k === 'a');
    expect(res).toEqual({ b: 2, c: 3 });
  });

  test('find', () => {
    const arr = [
      { a: 1, b: 2 },
      { a: 1, b: 3 },
      { a: 2, b: 3 },
      { a: 3, b: 4 },
    ];
    let res = find(arr, { b: 2 });
    expect(res).toEqual([{ a: 1, b: 2 }]);
    res = find(arr, { a: 1 });
    expect(res).toEqual([{ a: 1, b: 2 }, { a: 1, b: 3 }]);
  });

  test('partialEqual', () => {
    const obj1 = { a: 1, b: 2, c: 3 };
    const obj2 = { a: 1 };
    const obj3 = { a: 2 };
    const obj4 = { a: 1, b: 2, c: 4 };
    const obj5 = { a: 1, b: 2, c: 3 };

    expect(partialEqual(obj1, obj2)).toBe(true);
    expect(partialEqual(obj1, obj3)).toBe(false);
    expect(partialEqual(obj1, obj4)).toBe(false);
    expect(partialEqual(obj1, obj5)).toBe(true);
    expect(partialEqual(obj2, obj3)).toBe(false);
    expect(partialEqual(obj2, obj1)).toBe(true);
    expect(partialEqual(obj4, obj3)).toBe(false);
    expect(partialEqual(obj4, obj2)).toBe(true);
  });
});
