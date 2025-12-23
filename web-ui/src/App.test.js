import { render, screen } from '@testing-library/react';
import App from './App';


jest.mock("react-chartjs-2", () => ({
  Line: () => null
}));

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/Statistics/i);
  expect(linkElement).toBeInTheDocument();
});
