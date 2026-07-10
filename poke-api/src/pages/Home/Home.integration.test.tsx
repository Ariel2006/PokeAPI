import { render, screen } from '@testing-library/react';
import { Home } from './index';
import PokemonProvider from '../../context/PokemonContext';
import { MemoryRouter } from 'react-router-dom';

// Mock para componentes hijos
jest.mock('../../components/Filters', () => () => <div data-testid="filters-mock">Filters</div>);
jest.mock('../../components/PokemonList', () => () => <div data-testid="pokemon-list-mock">PokemonList</div>);
jest.mock('../../components/Pagination', () => () => <div data-testid="pagination-mock">Pagination</div>);

describe('Home Page - Integration Test', () => {
  it('should render all main components with providers', () => {
    render(
      <MemoryRouter>
        <PokemonProvider>
          <Home />
        </PokemonProvider>
      </MemoryRouter>
    );

    // Verificar que se renderizan todos los componentes principales
    expect(screen.getByText('Pokédex')).toBeInTheDocument();
    expect(screen.getByTestId('filters-mock')).toBeInTheDocument();
    expect(screen.getByTestId('pokemon-list-mock')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-mock')).toBeInTheDocument();
  });
});