import { describe, it, expect, vi, beforeEach } from 'vitest';
import { booksService } from './books.service';
import * as httpModule from '@/lib/http';

vi.mock('@/lib/http', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    blob: vi.fn(),
  },
  ApiError: class ApiError extends Error {},
}));

const mockBook = { id: '1', title: 'El Principito', slug: 'el-principito', price: 10, stock: 5 };
const mockPage = { items: [mockBook], total: 1, page: 1, limit: 10, totalPages: 1 };

describe('booksService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('findAll llama a http.get con los filtros serializados', async () => {
    vi.mocked(httpModule.http.get).mockResolvedValue(mockPage);
    const result = await booksService.findAll({ page: 1, limit: 10 });
    expect(httpModule.http.get).toHaveBeenCalledWith(expect.stringContaining('page=1'));
    expect(result).toBe(mockPage);
  });

  it('findAll sin filtros llama al endpoint base', async () => {
    vi.mocked(httpModule.http.get).mockResolvedValue(mockPage);
    await booksService.findAll();
    expect(httpModule.http.get).toHaveBeenCalled();
  });

  it('findBySlug llama con el slug correcto', async () => {
    vi.mocked(httpModule.http.get).mockResolvedValue(mockBook);
    const result = await booksService.findBySlug('el-principito');
    expect(httpModule.http.get).toHaveBeenCalledWith(expect.stringContaining('el-principito'));
    expect(result).toBe(mockBook);
  });

  it('create llama a http.post con el dto', async () => {
    vi.mocked(httpModule.http.post).mockResolvedValue(mockBook);
    const dto = { title: 'Test', price: 10, stock: 0, genreId: 'g1', authorId: 'a1', publisherId: 'p1' } as any;
    const result = await booksService.create(dto);
    expect(httpModule.http.post).toHaveBeenCalledWith(expect.any(String), dto);
    expect(result).toBe(mockBook);
  });

  it('update llama a http.patch con el id y dto', async () => {
    vi.mocked(httpModule.http.patch).mockResolvedValue(mockBook);
    const dto = { title: 'Actualizado', price: 20, stock: 1, genreId: 'g1', authorId: 'a1', publisherId: 'p1' } as any;
    await booksService.update('book-1', dto);
    expect(httpModule.http.patch).toHaveBeenCalledWith(expect.stringContaining('book-1'), dto);
  });

  it('remove llama a http.delete con el id', async () => {
    vi.mocked(httpModule.http.delete).mockResolvedValue(undefined);
    await booksService.remove('book-1');
    expect(httpModule.http.delete).toHaveBeenCalledWith(expect.stringContaining('book-1'));
  });

  it('restore llama a http.patch al endpoint de restore', async () => {
    vi.mocked(httpModule.http.patch).mockResolvedValue(mockBook);
    await booksService.restore('book-1');
    expect(httpModule.http.patch).toHaveBeenCalledWith(expect.stringContaining('restore'), {});
  });

  it('exportCsv llama a http.blob', async () => {
    vi.mocked(httpModule.http.blob).mockResolvedValue(new Blob(['csv']));
    await booksService.exportCsv({ status: 'active' });
    expect(httpModule.http.blob).toHaveBeenCalled();
  });
});
