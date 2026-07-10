import { render, screen } from '@testing-library/react';
import { PokemonList } from './index';

// Mock para usePokemon
jest.mock('../../../hooks/usePokemon', () => ({
  usePokemon: jest.fn().mockReturnValue({
    pokemon: {
      id: 1,
      name: 'bulbasaur',
      sprites: {
        front_default: 'bulbasaur.png',
      },
      types: [{ type: { name: 'grass' } }],
    },
  }),
}));

describe('PokemonList Component - Unit Test', () => {
  const mockUrls = ['url1', 'url2'];

  it('should render correct number of pokemon cards', () => {
    render(
      <PokemonList
        pokemonsUrls={mockUrls}
        page={1}
        perPage={12}
      />
    );

    expect(screen.getAllByTestId('pokemon-card')).toHaveLength(2);
  });

  it('should show loader when no pokemons', () => {
    render(
      <PokemonList
        pokemonsUrls={null}
        page={1}
        perPage={12}
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});