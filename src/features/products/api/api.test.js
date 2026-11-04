beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(Math, 'random').mockReturnValue(0.5);
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

async function loadApi() {
  jest.resetModules();
  return import('./api');
}

async function settle(promise) {
  const result = promise.then(
    (value) => ({ ok: true, value }),
    (error) => ({ ok: false, error }),
  );
  await jest.advanceTimersByTimeAsync(1500);
  return result;
}

async function resolved(promise) {
  const result = await settle(promise);
  if (!result.ok) throw result.error;
  return result.value;
}

async function rejected(promise) {
  const result = await settle(promise);
  if (result.ok) throw new Error('Sorğu uğurla bitdi, xəta gözlənilirdi');
  return result.error;
}

const validInput = {
  nameAz: 'Yeni yemək',
  nameEn: 'New dish',
  categoryId: 1,
  price: 5,
  isAvailable: true,
};

describe('şəbəkə simulyasiyası', () => {
  test('cavab təsadüfi gecikmədən sonra gəlir', async () => {
    const { getCategories } = await loadApi();
    let done = false;
    const promise = getCategories().then(() => {
      done = true;
    });

    await jest.advanceTimersByTimeAsync(899);
    expect(done).toBe(false);

    await jest.advanceTimersByTimeAsync(1);
    await promise;
    expect(done).toBe(true);
  });

  test('təsadüfi xəta ApiError(500) ilə bitir', async () => {
    const { getCategories, ApiError } = await loadApi();
    Math.random.mockReturnValue(0.01);

    const error = await rejected(getCategories());

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(500);
    expect(error.message).toBe('Server xətası. Yenidən cəhd edin.');
  });

  test('uğursuz sorğu datanı dəyişmir', async () => {
    const { createProduct, getProducts } = await loadApi();

    Math.random.mockReturnValue(0.01);
    await rejected(createProduct(validInput));

    Math.random.mockReturnValue(0.5);
    const result = await resolved(getProducts());
    expect(result.total).toBe(48);
  });
});

describe('getCategories', () => {
  test('6 kateqoriya qaytarır', async () => {
    const { getCategories } = await loadApi();
    const categories = await resolved(getCategories());

    expect(categories).toHaveLength(6);
    expect(categories[0]).toEqual({ id: 1, name: 'Şorbalar' });
  });

  test('nəticəni dəyişmək daxili datanı dəyişmir', async () => {
    const { getCategories } = await loadApi();
    const first = await resolved(getCategories());
    first[0].name = 'Dəyişdirildi';

    const second = await resolved(getCategories());
    expect(second[0].name).toBe('Şorbalar');
  });
});

describe('getProducts', () => {
  test('default olaraq 1-ci səhifə, 10 məhsul, cəmi 48', async () => {
    const { getProducts } = await loadApi();
    const result = await resolved(getProducts());

    expect(result.items).toHaveLength(10);
    expect(result.total).toBe(48);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.items[0].nameAz).toBe('Mərci şorbası');
  });

  test('sonuncu səhifədə 8 məhsul var', async () => {
    const { getProducts } = await loadApi();
    const result = await resolved(getProducts({ page: 5 }));

    expect(result.items).toHaveLength(8);
    expect(result.total).toBe(48);
  });

  test('aralıqdan kənar səhifə boş siyahı qaytarır, total qalır', async () => {
    const { getProducts } = await loadApi();
    const result = await resolved(getProducts({ page: 9 }));

    expect(result.items).toEqual([]);
    expect(result.total).toBe(48);
  });

  test('pageSize nəzərə alınır', async () => {
    const { getProducts } = await loadApi();
    const result = await resolved(getProducts({ page: 2, pageSize: 5 }));

    expect(result.items).toHaveLength(5);
    expect(result.items[0].id).toBe(6);
  });

  test('kateqoriyaya görə süzür', async () => {
    const { getProducts } = await loadApi();
    const result = await resolved(getProducts({ categoryId: 1 }));

    expect(result.total).toBe(8);
    expect(result.items.every((p) => p.categoryId === 1)).toBe(true);
  });

  test('Azərbaycan adına görə axtarır', async () => {
    const { getProducts } = await loadApi();
    const result = await resolved(getProducts({ search: 'dovğa' }));

    expect(result.total).toBe(1);
    expect(result.items[0].nameAz).toBe('Dovğa');
  });

  test('ingilis adına görə axtarır', async () => {
    const { getProducts } = await loadApi();
    const result = await resolved(getProducts({ search: 'lentil' }));

    expect(result.total).toBe(1);
    expect(result.items[0].nameAz).toBe('Mərci şorbası');
  });

  test('böyük hərflə və Azərbaycan hərfləri ilə axtarış işləyir', async () => {
    const { getProducts } = await loadApi();
    const result = await resolved(getProducts({ search: 'ŞAH' }));

    expect(result.total).toBe(1);
    expect(result.items[0].nameAz).toBe('Şah plov');
  });

  test('axtarışın kənar boşluqlarını silir', async () => {
    const { getProducts } = await loadApi();
    const result = await resolved(getProducts({ search: '  dovğa ' }));

    expect(result.total).toBe(1);
  });

  test('axtarış və kateqoriya birlikdə işləyir', async () => {
    const { getProducts } = await loadApi();
    const result = await resolved(getProducts({ search: 'toyuq', categoryId: 1 }));

    expect(result.total).toBe(1);
    expect(result.items[0].nameAz).toBe('Toyuq şorbası');
  });

  test('nəticə yoxdursa boş siyahı və total 0', async () => {
    const { getProducts } = await loadApi();
    const result = await resolved(getProducts({ search: 'xyz' }));

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});

describe('createProduct', () => {
  test('məhsulu yaradır, sona əlavə edir', async () => {
    const { createProduct, getProducts } = await loadApi();
    const created = await resolved(createProduct(validInput));

    expect(created).toEqual({ id: 49, ...validInput });

    const last = await resolved(getProducts({ page: 5 }));
    expect(last.total).toBe(49);
    expect(last.items[last.items.length - 1].id).toBe(49);
  });

  test('adların boşluqlarını silir, boş ingilis adını null edir', async () => {
    const { createProduct } = await loadApi();
    const created = await resolved(
      createProduct({ ...validInput, nameAz: '  Plov  ', nameEn: '   ' }),
    );

    expect(created.nameAz).toBe('Plov');
    expect(created.nameEn).toBeNull();
  });

  test.each([
    ['boş Azərbaycan adı', { nameAz: '' }, 'Azərbaycan dilində ad məcburidir.'],
    ['yalnız boşluqdan ibarət ad', { nameAz: '   ' }, 'Azərbaycan dilində ad məcburidir.'],
    ['mövcud olmayan kateqoriya', { categoryId: 99 }, 'Kateqoriya tapılmadı.'],
    ['sıfır qiymət', { price: 0 }, 'Qiymət 0-dan böyük olmalıdır.'],
    ['mənfi qiymət', { price: -5 }, 'Qiymət 0-dan böyük olmalıdır.'],
    ['NaN qiymət', { price: NaN }, 'Qiymət 0-dan böyük olmalıdır.'],
  ])('%s üçün ApiError(400) atır', async (_name, override, message) => {
    const { createProduct, ApiError } = await loadApi();
    const error = await rejected(createProduct({ ...validInput, ...override }));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.message).toBe(message);
  });
});

describe('updateProduct', () => {
  test('yalnız göndərilən sahəni dəyişir', async () => {
    const { updateProduct, getProducts } = await loadApi();
    const updated = await resolved(updateProduct(1, { isAvailable: false }));

    expect(updated.id).toBe(1);
    expect(updated.isAvailable).toBe(false);
    expect(updated.nameAz).toBe('Mərci şorbası');
    expect(updated.price).toBe(4.5);

    const list = await resolved(getProducts());
    expect(list.items[0].isAvailable).toBe(false);
  });

  test('boş ingilis adını null edir', async () => {
    const { updateProduct } = await loadApi();
    const updated = await resolved(updateProduct(1, { nameEn: '' }));

    expect(updated.nameEn).toBeNull();
  });

  test('olmayan məhsul üçün ApiError(404) atır', async () => {
    const { updateProduct, ApiError } = await loadApi();
    const error = await rejected(updateProduct(999, { price: 5 }));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    expect(error.message).toBe('Məhsul tapılmadı.');
  });

  test('yanlış dəyişiklik ApiError(400) atır və məhsul dəyişmir', async () => {
    const { updateProduct, getProducts } = await loadApi();
    const error = await rejected(updateProduct(1, { price: -1 }));

    expect(error.status).toBe(400);

    const list = await resolved(getProducts());
    expect(list.items[0].price).toBe(4.5);
  });
});