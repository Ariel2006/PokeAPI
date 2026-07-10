import { renderHook, act } from '@testing-library/react';
import { usePagination } from './usePagination';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  useSearchParams: jest.fn(),
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();
(useNavigate as jest.Mock).mockReturnValue(mockNavigate);

describe('usePagination Hook - Unit Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with page from URL', () => {
    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams('?page=2'),
      jest.fn()
    ]);

    const { result } = renderHook(() => usePagination());
    expect(result.current.page).toBe(2);
  });

  it('should initialize with page 1 if no page in URL', () => {
    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams(''),
      jest.fn()
    ]);

    const { result } = renderHook(() => usePagination());
    expect(result.current.page).toBe(1);
  });

  it('should navigate to next page', () => {
    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams('?page=2'),
      jest.fn()
    ]);

    const { result } = renderHook(() => usePagination());
    act(() => {
      result.current.nextPage();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/?page=3');
  });

  it('should navigate to previous page', () => {
    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams('?page=2'),
      jest.fn()
    ]);

    const { result } = renderHook(() => usePagination());
    act(() => {
      result.current.previousPage();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/?page=1');
  });
});