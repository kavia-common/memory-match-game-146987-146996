import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders game shell", () => {
  render(<App />);
  const title = screen.getByText(/Memory Match/i);
  expect(title).toBeInTheDocument();
});
