import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { usePokemon } from './usePokemon';

const mock = new MockAdapter(axios);

describe('usePokemon Hook - Unit Test', () => {
  afterEach(() => {
    mock.reset();
  });

  it('should fetch pokemon by URL', async () => {
    const mockUrl = 'https://pokeapi.co/api/v2/pokemon/1';
    const mockData = { id: 1, name: 'bulbasaur' };

    mock.onGet(mockUrl).reply(200, mockData);

    const { result } = renderHook(() =>
      usePokemon(mockUrl)
    );

    await waitFor(() => {
      expect(result.current.pokemon).toEqual(mockData);
    });
  });

  it('should fetch pokemon by ID', async () => {
    const mockId = '1';
    const mockData = { id: 1, name: 'bulbasaur' };

    mock.onGet(`https://pokeapi.co/api/v2/pokemon/${mockId}`).reply(200, mockData);

    const { result } = renderHook(() =>
      usePokemon('', mockId)
    );

    await waitFor(() => {
      expect(result.current.pokemon).toEqual(mockData);
    });
  });

  it('should handle fetch error', async () => {
    const mockUrl = 'https://pokeapi.co/api/v2/pokemon/999';
    mock.onGet(mockUrl).reply(404);

    const { result } = renderHook(() =>
      usePokemon(mockUrl)
    );

    await waitFor(() => {
      expect(result.current.pokemon).toBeUndefined();
    });
  });
});