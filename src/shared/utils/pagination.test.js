import { getPageItems, getVisibleRange } from './pagination';

describe('getPageItems', () => {
  test('az səhifə olanda hamısını göstərir', () => {
    expect(getPageItems(1, 1)).toEqual([1]);
    expect(getPageItems(2, 3)).toEqual([1, 2, 3]);
    expect(getPageItems(1, 4)).toEqual([1, 2, 3, 4]);
  });

  test('səhifə yoxdursa boş qaytarır', () => {
    expect(getPageItems(1, 0)).toEqual([]);
  });

  test('dizayndakı hal: 5 səhifə, cari 1', () => {
    expect(getPageItems(1, 5)).toEqual([1, 2, 3, '…', 5]);
  });

  test('5 səhifə, ortada heç nə gizlənmir', () => {
    expect(getPageItems(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  test('5 səhifə, sonda', () => {
    expect(getPageItems(5, 5)).toEqual([1, '…', 3, 4, 5]);
  });

  test('çox səhifə, ortada iki tərəfdə …', () => {
    expect(getPageItems(5, 10)).toEqual([1, '…', 4, 5, 6, '…', 10]);
  });

  test('çox səhifə, əvvəldə və sonda', () => {
    expect(getPageItems(1, 10)).toEqual([1, 2, 3, '…', 10]);
    expect(getPageItems(10, 10)).toEqual([1, '…', 8, 9, 10]);
  });
});

describe('getVisibleRange', () => {
  test('aralığı hesablayır', () => {
    expect(getVisibleRange(1, 10, 48)).toEqual({ from: 1, to: 10 });
    expect(getVisibleRange(5, 10, 48)).toEqual({ from: 41, to: 48 });
    expect(getVisibleRange(1, 10, 7)).toEqual({ from: 1, to: 7 });
    expect(getVisibleRange(1, 10, 0)).toEqual({ from: 0, to: 0 });
  });
});