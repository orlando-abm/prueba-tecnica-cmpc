import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('retorna el valor inicial inmediatamente', () => {
    const { result } = renderHook(() => useDebounce('hola'));
    expect(result.current).toBe('hola');
  });

  it('no actualiza antes de que pase el delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'inicial' },
    });
    rerender({ value: 'nuevo' });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('inicial');
  });

  it('actualiza el valor después del delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'inicial' },
    });
    rerender({ value: 'nuevo' });
    act(() => vi.advanceTimersByTime(400));
    expect(result.current).toBe('nuevo');
  });

  it('cancela el timer anterior si el valor cambia antes del delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'b' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'c' });
    act(() => vi.advanceTimersByTime(400));
    expect(result.current).toBe('c');
  });

  it('respeta el delay personalizado', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 1000), {
      initialProps: { value: 'x' },
    });
    rerender({ value: 'y' });
    act(() => vi.advanceTimersByTime(999));
    expect(result.current).toBe('x');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('y');
  });
});
