import { render, screen } from '@testing-library/react';
import { Loader } from './index';

describe('Loader Component - Unit Test', () => {
  it('should render with default props', () => {
    render(<Loader color="#fff" />);
    const loader = screen.getByRole('status');
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveStyle('borderColor: white');
  });

  it('should render with custom size', () => {
    render(<Loader color="#f00" size={50} />);
    const loader = screen.getByRole('status');
    expect(loader).toHaveStyle('width: 50px');
    expect(loader).toHaveStyle('height: 50px');
  });
});