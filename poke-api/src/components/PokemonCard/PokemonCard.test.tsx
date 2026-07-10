import { render, screen } from '@testing-library/react';
import { PokemonCard } from './index';

describe('PokemonCard Component - Unit Test', () => {
  const mockUrl = 'https://pokeapi.co/api/v2/pokemon/1';

  it('should render pokemon data', () => {
    jest.mock('../../../hooks/usePokemon', () => ({
      usePokemon: jest.fn().mockReturnValue({
        pokemon: {
          id: 1,
          name: 'bulbasaur',
          sprites: {
            front_default: 'bulbasaur.png',
            other: { dream_world: { front_default: 'dream.png' } }
          },
          types: [{ type: { name: 'grass' } }],
        },
      }),
    }));

    render(<PokemonCard url={mockUrl} />);

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    expect(screen.getByAltText('bulbasaur')).toHaveAttribute('src', 'dream.png');
  });

  it('should show loader when loading', () => {
    jest.mock('../../../hooks/usePokemon', () => ({
      usePokemon: jest.fn().mockReturnValue({ pokemon: null }),
    }));

    render(<PokemonCard url={mockUrl} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});