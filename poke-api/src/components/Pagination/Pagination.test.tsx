import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './index';

describe('Pagination Component - Unit Test', () => {
  const mockProps = {
    perPage: 12,
    page: 2,
    nextPage: jest.fn(),
    previousPage: jest.fn(),
    maxItems: 36,
  };

  it('should render current page', () => {
    render(<Pagination {...mockProps} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should call nextPage when clicking next', () => {
    render(<Pagination {...mockProps} />);
    fireEvent.click(screen.getByText('>'));
    expect(mockProps.nextPage).toHaveBeenCalled();
  });

  it('should call previousPage when clicking prev', () => {
    render(<Pagination {...mockProps} />);
    fireEvent.click(screen.getByText('<'));
    expect(mockProps.previousPage).toHaveBeenCalled();
  });

  it('should disable buttons when on first/last page', () => {
    const firstPageProps = { ...mockProps, page: 1 };
    render(<Pagination {...firstPageProps} />);
    expect(screen.getByText('<')).toBeDisabled();

    const lastPageProps = { ...mockProps, page: 3 };
    render(<Pagination {...lastPageProps} />);
    expect(screen.getByText('>')).toBeDisabled();
  });
});