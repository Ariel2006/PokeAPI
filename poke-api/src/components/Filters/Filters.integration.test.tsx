import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Filters } from './index';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { PokemonContext } from '../../context/PokemonContext';

describe('Filters Component - Integration Test', () => {
  const changeTypeSelectedMock = jest.fn();

  const mockTypes = [
    { name: "All", url: "all-url" },
    { name: "fire", url: "fire-url" },
    { name: "water", url: "water-url" },
  ];

  const mockContextValue = {
    types: mockTypes,
    filterSelected: { name: "All", url: "all-url" },
    pokemonsFiltered: [],
    changeTypeSelected: changeTypeSelectedMock,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render and interact with type selection', async () => {
    render(
      <MemoryRouter>
        <PokemonContext.Provider value={mockContextValue}>
          <Filters />
        </PokemonContext.Provider>
      </MemoryRouter>
    );

    // Usa getByText para encontrar el elemento que muestra 'All' y abrir el dropdown
    const toggleElement = screen.getByText('All');
    await userEvent.click(toggleElement);

    // Verificar que las opciones 'fire' y 'water' se muestren en el dropdown
    expect(screen.getByText('fire')).toBeInTheDocument();
    expect(screen.getByText('water')).toBeInTheDocument();

    // Seleccionar la opción 'fire'
    await userEvent.click(screen.getByText('fire'));

    // Verificar que se llamó a la función changeTypeSelected con el argumento correcto
    expect(changeTypeSelectedMock).toHaveBeenCalledWith({ name: 'fire', url: 'fire-url' });
  });
});
