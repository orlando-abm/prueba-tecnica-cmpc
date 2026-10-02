import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, ApiError } from './http';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const makeStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; },
  };
};
const ls = makeStorage();
const ss = makeStorage();
vi.stubGlobal('localStorage', ls);
vi.stubGlobal('sessionStorage', ss);

const jsonResponse = (data: unknown, ok = true, status = 200) =>
  Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
  } as Response);

describe('ApiError', () => {
  it('instancia correctamente con status y error', () => {
    const err = new ApiError(404, { code: 'BOOK_001', message: 'No encontrado' });
    expect(err.status).toBe(404);
    expect(err.error.code).toBe('BOOK_001');
    expect(err.message).toBe('No encontrado');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('http.get', () => {
  beforeEach(() => mockFetch.mockClear());
  afterEach(() => ls.clear());

  it('retorna data cuando la respuesta es exitosa', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ success: true, data: { id: '1' } }));
    const result = await http.get('/test');
    expect(result).toEqual({ id: '1' });
  });

  it('lanza ApiError cuando success es false', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ success: false, error: { code: 'ERR', message: 'Fallo' } }, false, 400),
    );
    await expect(http.get('/test')).rejects.toBeInstanceOf(ApiError);
  });

  it('incluye Authorization header cuando hay token en localStorage', async () => {
    ls.setItem('auth-token', 'mi-token');
    mockFetch.mockResolvedValue(jsonResponse({ success: true, data: null }));
    await http.get('/test');
    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBe('Bearer mi-token');
  });

  it('no incluye Authorization header sin token', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ success: true, data: null }));
    await http.get('/test');
    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBeUndefined();
  });

  it('retorna undefined para respuestas 204', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204, json: vi.fn() } as unknown as Response);
    const result = await http.delete('/test');
    expect(result).toBeUndefined();
  });
});

describe('http.post', () => {
  beforeEach(() => mockFetch.mockClear());

  it('serializa el body como JSON', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ success: true, data: { id: '1' } }));
    await http.post('/test', { name: 'test' });
    const init = mockFetch.mock.calls[0][1];
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ name: 'test' }));
  });
});

describe('http.patch', () => {
  beforeEach(() => mockFetch.mockClear());

  it('usa método PATCH', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ success: true, data: {} }));
    await http.patch('/test', {});
    expect(mockFetch.mock.calls[0][1].method).toBe('PATCH');
  });
});
