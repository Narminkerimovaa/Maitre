import { withRetry } from './withRetry';

describe('withRetry', () => {
  test('ilk cəhd uğurludursa bir dəfə çağırır', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    await expect(withRetry(fn, 2, 0)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('uğursuzluqdan sonra təkrar edib uğur qazanır', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('a'))
      .mockRejectedValueOnce(new Error('b'))
      .mockResolvedValue('ok');
    await expect(withRetry(fn, 2, 0)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('hamısı uğursuz olsa son xətanı atır', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('a'))
      .mockRejectedValueOnce(new Error('b'))
      .mockRejectedValueOnce(new Error('c'));
    await expect(withRetry(fn, 2, 0)).rejects.toThrow('c');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});