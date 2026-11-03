import { getCategories } from '@/features/products/api/api';
import { useCategoriesStore } from './categoriesStore';

jest.mock('@/features/products/api/api');

const categories = [
  { id: 1, name: 'Şorbalar' },
  { id: 2, name: 'Əsas yeməklər' },
];

beforeEach(() => {
  jest.resetAllMocks();
  useCategoriesStore.setState(useCategoriesStore.getInitialState(), true);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('categoriesStore', () => {
  test('başlanğıc vəziyyət', () => {
    const { items, status } = useCategoriesStore.getState();
    expect(items).toEqual([]);
    expect(status).toBe('idle');
  });

  test('uğurlu yükləmə', async () => {
    getCategories.mockResolvedValue(categories);
    await useCategoriesStore.getState().fetchCategories();

    const { items, status } = useCategoriesStore.getState();
    expect(items).toEqual(categories);
    expect(status).toBe('success');
  });

  test('yükləndikdən sonra təkrar sorğu göndərmir', async () => {
    getCategories.mockResolvedValue(categories);
    await useCategoriesStore.getState().fetchCategories();
    await useCategoriesStore.getState().fetchCategories();
    expect(getCategories).toHaveBeenCalledTimes(1);
  });

  test('yüklənərkən ikinci çağırış yeni sorğu göndərmir', async () => {
    getCategories.mockResolvedValue(categories);
    const first = useCategoriesStore.getState().fetchCategories();
    const second = useCategoriesStore.getState().fetchCategories();
    await Promise.all([first, second]);
    expect(getCategories).toHaveBeenCalledTimes(1);
  });

  test('xətadan sonra avtomatik təkrar edib uğur qazanır', async () => {
    jest.useFakeTimers();
    getCategories
      .mockRejectedValueOnce(new Error('a'))
      .mockResolvedValue(categories);

    const promise = useCategoriesStore.getState().fetchCategories();
    await jest.advanceTimersByTimeAsync(1000);
    await promise;

    expect(getCategories).toHaveBeenCalledTimes(2);
    expect(useCategoriesStore.getState().status).toBe('success');
  });

  test('hamısı uğursuz olsa status error olur və sonra yenidən cəhd olunur', async () => {
    jest.useFakeTimers();
    getCategories.mockRejectedValue(new Error('x'));

    const promise = useCategoriesStore.getState().fetchCategories();
    await jest.advanceTimersByTimeAsync(1000);
    await promise;

    expect(getCategories).toHaveBeenCalledTimes(3);
    expect(useCategoriesStore.getState().status).toBe('error');

    getCategories.mockResolvedValue(categories);
    await useCategoriesStore.getState().fetchCategories();
    expect(useCategoriesStore.getState().status).toBe('success');
  });
});