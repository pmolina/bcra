import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchDebtHistory, fetchRejectedChecks, NotFoundError } from './bcra';

const mockFetch = vi.fn();
beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
});

describe('fetchDebtHistory', () => {
  it('returns parsed JSON on success', async () => {
    const body = { status: 200, results: { identificacion: 1, denominacion: 'Test', periodos: [] } };
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(body) });
    const result = await fetchDebtHistory('20123456783');
    expect(result).toEqual(body);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/Historicas/20123456783'));
  });

  it('throws NotFoundError on 404', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });
    await expect(fetchDebtHistory('20123456783')).rejects.toThrow(NotFoundError);
  });

  it('throws generic error on other failures', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    await expect(fetchDebtHistory('20123456783')).rejects.toThrow('Error 500');
  });
});

describe('fetchRejectedChecks', () => {
  it('returns parsed JSON on success', async () => {
    const body = { status: 200, results: { identificacion: 1, denominacion: 'Test', causales: [] } };
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(body) });
    const result = await fetchRejectedChecks('20123456783');
    expect(result).toEqual(body);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/ChequesRechazados/20123456783'));
  });

  it('throws NotFoundError on 404', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });
    await expect(fetchRejectedChecks('20123456783')).rejects.toThrow(NotFoundError);
  });
});
