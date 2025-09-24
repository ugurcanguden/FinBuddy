import { act, renderHook, waitFor } from '@testing-library/react';
import type { Mock } from 'vitest';
import { usePaymentReminders } from '../usePaymentReminders';
import { storageService } from '@/services';
import { STORAGE_KEYS } from '@/constants';

vi.mock('@/services', () => ({
  storageService: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

type StorageServiceMock = {
  get: Mock;
  set: Mock;
};

const mockedStorage = storageService as unknown as StorageServiceMock;

const defaultSettings = {
  enabled: true,
  time: '09:00',
  days: [1, 2, 3, 4, 5],
  channels: {
    myPayments: true,
    upcomingPayments: true,
  },
};

describe('usePaymentReminders', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('mevcut ayarları depodan yükler ve varsayılanlarla birleştirir', async () => {
    mockedStorage.get.mockResolvedValueOnce({ enabled: false, time: '21:30' });

    const { result } = renderHook(() => usePaymentReminders());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockedStorage.get).toHaveBeenCalledWith(STORAGE_KEYS.PAYMENT_REMINDERS);
    expect(result.current.settings).toEqual({
      ...defaultSettings,
      enabled: false,
      time: '21:30',
    });
    expect(mockedStorage.set).not.toHaveBeenCalled();
  });

  it('kayıt bulunmadığında varsayılan ayarları kaydeder ve döndürür', async () => {
    mockedStorage.get.mockResolvedValueOnce(null);
    mockedStorage.set.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => usePaymentReminders());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockedStorage.set).toHaveBeenCalledWith(
      STORAGE_KEYS.PAYMENT_REMINDERS,
      defaultSettings,
    );
    expect(result.current.settings).toEqual(defaultSettings);
  });

  it('ayarlar yüklenirken hata aldığında varsayılanları döndürür ve hatayı loglar', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedStorage.get.mockRejectedValueOnce(new Error('AsyncStorage erişim hatası'));

    const { result } = renderHook(() => usePaymentReminders());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.settings).toEqual(defaultSettings);
    expect(mockedStorage.set).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Payment reminders ayarları yüklenemedi:',
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it('hatırlatıcıları değiştirirken depolamayı günceller ve state değerini senkron tutar', async () => {
    mockedStorage.get.mockResolvedValueOnce(defaultSettings);
    mockedStorage.set.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePaymentReminders());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleReminders(false);
    });

    expect(mockedStorage.set).toHaveBeenLastCalledWith(STORAGE_KEYS.PAYMENT_REMINDERS, {
      ...defaultSettings,
      enabled: false,
    });
    expect(result.current.settings.enabled).toBe(false);
  });

  it('depoya yazma hatası aldığında önceki state değerini korur', async () => {
    mockedStorage.get.mockResolvedValueOnce(defaultSettings);
    mockedStorage.set.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePaymentReminders());

    await waitFor(() => expect(result.current.loading).toBe(false));

    mockedStorage.set.mockRejectedValueOnce(new Error('Kaydetme hatası'));

    await act(async () => {
      await result.current.updateTime('12:45');
    });

    expect(result.current.settings.time).toBe(defaultSettings.time);
  });
});
