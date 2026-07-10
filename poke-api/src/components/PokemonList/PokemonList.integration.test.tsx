import { render, screen } from '@testing-library/react';
import { PokemonList } from './index';
import PokemonProvider from '../../context/PokemonContext';

// Mock para usePokemon hook
jest.mock('../../../hooks/usePokemon', () => ({
  usePokemon: () => ({
    pokemon: {
      id: 1,
      name: 'bulbasaur',
      sprites: {
        front_default: 'bulbasaur.png',
        other: {
          dream_world: {
            front_default: 'bulbasaur-dream.png'
          }
        }
      },
      types: [
        {
          type: {
            name: 'grass'
          }
        }
      ]
    }
  }),
}));

describe('PokemonList Component - Integration Test', () => {
  it('should render pokemon cards with data from context', () => {
    // Mock de las URLs de Pokémon
    const mockPokemonsUrls = [
      'https://pokeapi.co/api/v2/pokemon/1',
      'https://pokeapi.co/api/v2/pokemon/2'
    ];

    render(
      <PokemonProvider>
        <PokemonList
          pokemonsUrls={mockPokemonsUrls}
          page={1}
          perPage={12}
        />
      </PokemonProvider>
    );

    // Verificar que se renderizan los Pokémon
    expect(screen.getAllByTestId('pokemon-card')).toHaveLength(2);
    expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
  });
});