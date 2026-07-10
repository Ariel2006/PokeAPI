import { render, screen } from '@testing-library/react';
import { PokeDetail } from './index';
import { MemoryRouter } from 'react-router-dom';

// Mock para usePokemon hook
jest.mock('../../hooks/usePokemon', () => ({
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
      ],
      weight: 69,
      height: 7,
      stats: [
        { base_stat: 45, stat: { name: 'hp' } },
        { base_stat: 49, stat: { name: 'attack' } }
      ],
      abilities: [
        { ability: { name: 'overgrow' } }
      ]
    }
  }),
}));

describe('PokeDetail Page - Integration Test', () => {
  it('should render pokemon details correctly', () => {
    render(
      <MemoryRouter>
        <PokeDetail />
      </MemoryRouter>
    );

    // Verificar que se renderiza la información del Pokémon
    expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('grass')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Base Stats')).toBeInTheDocument();
    expect(screen.getByText('69')).toBeInTheDocument(); // weight
    expect(screen.getByText('7')).toBeInTheDocument(); // height
  });
});