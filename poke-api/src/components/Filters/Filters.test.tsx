import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Filters } from './index';

// Mock para usePagination
jest.mock('../../../hooks/usePagination', () => ({
  usePagination: jest.fn().mockReturnValue({
    changePage: jest.fn(),
  }),
}));

// Mock para el contexto
jest.mock('../../../context/PokemonContext', () => ({
  useContext: jest.fn().mockReturnValue({
    types: [
      { name: 'All', url: 'all-url' },
      { name: 'fire', url: 'fire-url' },
    ],
    filterSelected: { name: 'All', url: 'all-url' },
    changeTypeSelected: jest.fn(),
  }),
}));

describe('Filters Component - Unit Test', () => {
  it('should render with default filter', () => {
    render(<Filters />);
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('should show types when clicked', async () => {
    render(<Filters />);
    const button = screen.getByText('All');
    await userEvent.click(button);

    expect(screen.getByText('fire')).toBeInTheDocument();
  });
});