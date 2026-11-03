import { useToastStore, toast, TOAST_DURATION_MS } from './toastStore';

beforeEach(() => {
  jest.useFakeTimers();
  useToastStore.setState(useToastStore.getInitialState(), true);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('toastStore', () => {
  test('bildiriş əlavə edir', () => {
    toast.success('Saxlanıldı');
    expect(useToastStore.getState().toasts).toEqual([
      expect.objectContaining({ type: 'success', message: 'Saxlanıldı' }),
    ]);
  });

  test('hər bildirişin id-si fərqlidir', () => {
    const a = toast.success('a');
    const b = toast.error('b');
    expect(a).not.toBe(b);
    expect(useToastStore.getState().toasts).toHaveLength(2);
  });

  test('əl ilə bağlanır', () => {
    const id = toast.error('xəta');
    useToastStore.getState().dismiss(id);
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  test('müddət bitəndə avtomatik silinir', () => {
    toast.success('a');
    jest.advanceTimersByTime(TOAST_DURATION_MS - 1);
    expect(useToastStore.getState().toasts).toHaveLength(1);
    jest.advanceTimersByTime(1);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});