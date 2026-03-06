import { render, screen } from "@testing-library/react"

function Button({ label }: { label: string }) {
  return <button>{label}</button>
}

describe("Button (unit)", () => {
  it("renders label", () => {
    render(<Button label="Click me" />)
    expect(screen.getByText("Click me")).toBeInTheDocument()
  })
})