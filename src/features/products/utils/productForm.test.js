import {
  EMPTY_FORM,
  hasChanges,
  isFormDirty,
  toFormState,
  toProductInput,
} from './productForm';

const product = {
  id: 1,
  nameAz: 'Dovğa',
  nameEn: 'Yogurt soup',
  categoryId: 1,
  price: 3.8,
  isAvailable: true,
};

describe('EMPTY_FORM', () => {
  test('yeni məhsul default olaraq satışdadır', () => {
    expect(EMPTY_FORM).toEqual({
      nameAz: '',
      nameEn: '',
      categoryId: '',
      price: '',
      isAvailable: true,
    });
  });
});

describe('toFormState', () => {
  test('məhsulu forma dəyərlərinə çevirir', () => {
    expect(toFormState(product)).toEqual({
      nameAz: 'Dovğa',
      nameEn: 'Yogurt soup',
      categoryId: '1',
      price: '3,80',
      isAvailable: true,
    });
  });

  test('ingilis adı null-dursa boş sətir olur', () => {
    expect(toFormState({ ...product, nameEn: null }).nameEn).toBe('');
  });

  test('tam qiyməti iki onluqla yazır', () => {
    expect(toFormState({ ...product, price: 18 }).price).toBe('18,00');
  });
});

describe('toProductInput', () => {
  const state = {
    nameAz: '  Plov ',
    nameEn: '  Pilaf ',
    categoryId: '2',
    price: '18,5',
    isAvailable: false,
  };

  test('API üçün məlumata çevirir', () => {
    expect(toProductInput(state)).toEqual({
      nameAz: 'Plov',
      nameEn: 'Pilaf',
      categoryId: 2,
      price: 18.5,
      isAvailable: false,
    });
  });

  test('boş ingilis adı null olur', () => {
    expect(toProductInput({ ...state, nameEn: '   ' }).nameEn).toBeNull();
  });

  test('yanlış qiymətdə null qaytarır', () => {
    expect(toProductInput({ ...state, price: 'abc' })).toBeNull();
  });
});

describe('hasChanges', () => {
  const same = {
    nameAz: 'Dovğa',
    nameEn: 'Yogurt soup',
    categoryId: 1,
    price: 3.8,
    isAvailable: true,
  };

  test('dəyişiklik yoxdursa false qaytarır', () => {
    expect(hasChanges(product, same)).toBe(false);
  });

  test('hər sahənin dəyişməsini tanıyır', () => {
    expect(hasChanges(product, { ...same, nameAz: 'Başqa' })).toBe(true);
    expect(hasChanges(product, { ...same, nameEn: null })).toBe(true);
    expect(hasChanges(product, { ...same, categoryId: 2 })).toBe(true);
    expect(hasChanges(product, { ...same, price: 4 })).toBe(true);
    expect(hasChanges(product, { ...same, isAvailable: false })).toBe(true);
  });

  test('ingilis adı null olan məhsulda null dəyişiklik sayılmır', () => {
    expect(hasChanges({ ...product, nameEn: null }, { ...same, nameEn: null })).toBe(false);
  });
});

describe('isFormDirty', () => {
  const base = toFormState(product);

  test('dəyişiklik yoxdursa false qaytarır', () => {
    expect(isFormDirty(EMPTY_FORM, { ...EMPTY_FORM })).toBe(false);
    expect(isFormDirty(base, { ...base })).toBe(false);
  });

  test('hər sahənin dəyişməsi dirty sayılır', () => {
    expect(isFormDirty({ ...base, nameAz: 'X' }, base)).toBe(true);
    expect(isFormDirty({ ...base, nameEn: 'X' }, base)).toBe(true);
    expect(isFormDirty({ ...base, categoryId: '2' }, base)).toBe(true);
    expect(isFormDirty({ ...base, price: '9,00' }, base)).toBe(true);
    expect(isFormDirty({ ...base, isAvailable: false }, base)).toBe(true);
  });
});