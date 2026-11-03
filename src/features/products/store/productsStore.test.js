import {
  createProduct,
  getProducts,
  updateProduct,
} from '@/features/products/api/api';
import { toast } from '@/shared/ui/Toast/toastStore';
import { useProductsStore, getTotalPages } from './productsStore';

jest.mock('@/features/products/api/api');
jest.mock('@/shared/ui/Toast/toastStore');

const product = (id, extra = {}) => ({
  id,
  nameAz: `Məhsul ${id}`,
  nameEn: null,
  categoryId: 1,
  price: 5,
  isAvailable: true,
  ...extra,
});

const result = (items, total = items.length) => ({
  items,
  total,
  page: 1,
  pageSize: 10,
});

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const store = () => useProductsStore.getState();

beforeEach(() => {
  jest.resetAllMocks();
  useProductsStore.setState(useProductsStore.getInitialState(), true);
});

describe('getTotalPages', () => {
  test('səhifə sayını hesablayır', () => {
    expect(getTotalPages(0)).toBe(1);
    expect(getTotalPages(10)).toBe(1);
    expect(getTotalPages(11)).toBe(2);
    expect(getTotalPages(48)).toBe(5);
  });
});

describe('fetchProducts', () => {
  test('başlanğıc vəziyyət', () => {
    expect(store().status).toBe('idle');
    expect(store().items).toEqual([]);
    expect(store().query).toEqual({ search: '', categoryId: null, page: 1 });
  });

  test('uğurlu yükləmə', async () => {
    getProducts.mockResolvedValue(result([product(1), product(2)], 48));
    await store().fetchProducts();

    expect(store().items).toHaveLength(2);
    expect(store().total).toBe(48);
    expect(store().status).toBe('success');
    expect(store().hasLoadedOnce).toBe(true);
  });

  test('parametrləri API-yə düzgün ötürür', async () => {
    getProducts.mockResolvedValue(result([]));
    await store().fetchProducts();
    expect(getProducts).toHaveBeenLastCalledWith({
      search: undefined,
      categoryId: undefined,
      page: 1,
      pageSize: 10,
    });

    await store().init({ search: 'dovğa', categoryId: 2, page: 3 });
    expect(getProducts).toHaveBeenLastCalledWith({
      search: 'dovğa',
      categoryId: 2,
      page: 3,
      pageSize: 10,
    });
  });

  test('xətada status error olur və mesaj saxlanır', async () => {
    getProducts.mockRejectedValue(new Error('Server xətası. Yenidən cəhd edin.'));
    await store().fetchProducts();

    expect(store().status).toBe('error');
    expect(store().error).toBe('Server xətası. Yenidən cəhd edin.');
    expect(store().hasLoadedOnce).toBe(false);
  });

  test('köhnə sorğunun cavabı ignor edilir', async () => {
    const first = deferred();
    const second = deferred();
    getProducts
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    const a = store().fetchProducts();
    const b = store().fetchProducts();

    second.resolve(result([product(2)]));
    await b;
    first.resolve(result([product(1)]));
    await a;

    expect(store().items.map((p) => p.id)).toEqual([2]);
  });

  test('aralıqdan kənar səhifə sonuncuya düzəlir', async () => {
    useProductsStore.setState({ query: { search: '', categoryId: null, page: 9 } });
    getProducts
      .mockResolvedValueOnce(result([], 48))
      .mockResolvedValueOnce(result([product(1)], 48));

    await store().fetchProducts();

    expect(getProducts).toHaveBeenCalledTimes(2);
    expect(store().query.page).toBe(5);
    expect(store().items).toHaveLength(1);
  });

  test('total 0 olanda səhifə düzəldilmir', async () => {
    useProductsStore.setState({ query: { search: 'yoxdur', categoryId: null, page: 1 } });
    getProducts.mockResolvedValue(result([], 0));

    await store().fetchProducts();

    expect(getProducts).toHaveBeenCalledTimes(1);
    expect(store().status).toBe('success');
    expect(store().items).toEqual([]);
  });
});

describe('filter və səhifə', () => {
  beforeEach(() => {
    getProducts.mockResolvedValue(result([product(1)], 48));
  });

  test('setSearch səhifəni 1-ə qaytarır və yükləyir', async () => {
    useProductsStore.setState({ query: { search: '', categoryId: null, page: 3 } });
    await store().setSearch('plov');

    expect(store().query).toEqual({ search: 'plov', categoryId: null, page: 1 });
    expect(getProducts).toHaveBeenCalledTimes(1);
  });

  test('eyni axtarış dəyəri yeni sorğu göndərmir', async () => {
    await store().setSearch('');
    expect(getProducts).not.toHaveBeenCalled();
  });

  test('setCategory səhifəni 1-ə qaytarır', async () => {
    useProductsStore.setState({ query: { search: '', categoryId: null, page: 4 } });
    await store().setCategory(2);

    expect(store().query).toEqual({ search: '', categoryId: 2, page: 1 });
    expect(getProducts).toHaveBeenCalledTimes(1);
  });

  test('setPage səhifəni dəyişir, 1-dən aşağı düşmür', async () => {
    await store().setPage(3);
    expect(store().query.page).toBe(3);

    await store().setPage(-5);
    expect(store().query.page).toBe(1);
  });

  test('resetFilters hər şeyi sıfırlayır', async () => {
    useProductsStore.setState({ query: { search: 'x', categoryId: 2, page: 3 } });
    await store().resetFilters();

    expect(store().query).toEqual({ search: '', categoryId: null, page: 1 });
    expect(getProducts).toHaveBeenCalledTimes(1);
  });

  test('resetFilters artıq default-dursa sorğu göndərmir', async () => {
    await store().resetFilters();
    expect(getProducts).not.toHaveBeenCalled();
  });
});

describe('toggleAvailability', () => {
  beforeEach(() => {
    useProductsStore.setState({ items: [product(1), product(2)] });
  });

  test('optimistic dəyişir, sonra server cavabı ilə əvəz olunur', async () => {
    const pending = deferred();
    updateProduct.mockReturnValue(pending.promise);

    const promise = store().toggleAvailability(1);
    expect(store().items[0].isAvailable).toBe(false);
    expect(store().togglingIds).toEqual([1]);

    pending.resolve(product(1, { isAvailable: false }));
    await promise;

    expect(updateProduct).toHaveBeenCalledWith(1, { isAvailable: false });
    expect(store().items[0].isAvailable).toBe(false);
    expect(store().togglingIds).toEqual([]);
  });

  test('xətada geri qaytarır və xəta bildirişi göstərir', async () => {
    updateProduct.mockRejectedValue(new Error('x'));
    await store().toggleAvailability(1);

    expect(store().items[0].isAvailable).toBe(true);
    expect(store().togglingIds).toEqual([]);
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  test('sorğu gedərkən ikinci klik nəzərə alınmır', async () => {
    const pending = deferred();
    updateProduct.mockReturnValue(pending.promise);

    const first = store().toggleAvailability(1);
    await store().toggleAvailability(1);
    pending.resolve(product(1, { isAvailable: false }));
    await first;

    expect(updateProduct).toHaveBeenCalledTimes(1);
  });

  test('siyahıda olmayan id nəzərə alınmır', async () => {
    await store().toggleAvailability(999);
    expect(updateProduct).not.toHaveBeenCalled();
  });
});

describe('createProduct və updateProduct', () => {
  const input = {
    nameAz: 'Yeni',
    nameEn: null,
    categoryId: 1,
    price: 5,
    isAvailable: true,
  };

  test('createProduct məhsulu qaytarır və siyahını yeniləyir', async () => {
    createProduct.mockResolvedValue(product(49));
    getProducts.mockResolvedValue(result([product(49)], 49));

    const created = await store().createProduct(input);

    expect(created.id).toBe(49);
    expect(createProduct).toHaveBeenCalledWith(input);
    expect(getProducts).toHaveBeenCalledTimes(1);
  });

  test('createProduct xətanı yuxarı atır, siyahını yeniləmir', async () => {
    createProduct.mockRejectedValue(new Error('Kateqoriya tapılmadı.'));

    await expect(store().createProduct(input)).rejects.toThrow('Kateqoriya tapılmadı.');
    expect(getProducts).not.toHaveBeenCalled();
  });

  test('updateProduct siyahıdakı sətri əvəz edir', async () => {
    useProductsStore.setState({ items: [product(1), product(2)] });
    updateProduct.mockResolvedValue(product(2, { nameAz: 'Dəyişdi', price: 9 }));

    await store().updateProduct(2, { nameAz: 'Dəyişdi', price: 9 });

    expect(store().items[1].nameAz).toBe('Dəyişdi');
    expect(store().items[0].nameAz).toBe('Məhsul 1');
  });

  test('updateProduct xətanı yuxarı atır, siyahı dəyişmir', async () => {
    useProductsStore.setState({ items: [product(1)] });
    updateProduct.mockRejectedValue(new Error('Məhsul tapılmadı.'));

    await expect(store().updateProduct(1, { price: 9 })).rejects.toThrow('Məhsul tapılmadı.');
    expect(store().items[0].price).toBe(5);
  });
});