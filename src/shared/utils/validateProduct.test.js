import { validateProduct } from './validateProduct';

const valid = { nameAz: 'Dovğa', nameEn: 'Yogurt soup', categoryId: '1', price: '3,80' };

describe('validateProduct', () => {
  test('düzgün məlumatda xəta yoxdur', () => {
    expect(validateProduct(valid)).toEqual({});
  });

  test('ingilis adı boş ola bilər', () => {
    expect(validateProduct({ ...valid, nameEn: '' })).toEqual({});
  });

  test('Azərbaycan adı boş və ya yalnız boşluqdursa xəta verir', () => {
    expect(validateProduct({ ...valid, nameAz: '' }).nameAz).toBeDefined();
    expect(validateProduct({ ...valid, nameAz: '   ' }).nameAz).toBeDefined();
  });

  test('80 simvoldan uzun ad xəta verir', () => {
    const long = 'a'.repeat(81);
    expect(validateProduct({ ...valid, nameAz: long }).nameAz).toBeDefined();
    expect(validateProduct({ ...valid, nameEn: long }).nameEn).toBeDefined();
    expect(validateProduct({ ...valid, nameAz: 'a'.repeat(80) })).toEqual({});
  });

  test('kateqoriya seçilməyibsə xəta verir', () => {
    expect(validateProduct({ ...valid, categoryId: '' }).categoryId).toBeDefined();
  });

  test('qiymət qaydaları', () => {
    expect(validateProduct({ ...valid, price: '' }).price).toBe('Qiymət daxil edin.');
    expect(validateProduct({ ...valid, price: 'abc' }).price).toMatch(/Düzgün qiymət/);
    expect(validateProduct({ ...valid, price: '-3' }).price).toMatch(/Düzgün qiymət/);
    expect(validateProduct({ ...valid, price: '0' }).price).toMatch(/0-dan böyük/);
    expect(validateProduct({ ...valid, price: '4.5' })).toEqual({});
  });

  test('bir neçə xəta eyni anda qaytarılır', () => {
    const errors = validateProduct({ nameAz: '', nameEn: '', categoryId: '', price: '' });
    expect(Object.keys(errors).sort()).toEqual(['categoryId', 'nameAz', 'price']);
  });
});