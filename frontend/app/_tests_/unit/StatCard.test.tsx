import { render, screen } from "@testing-library/react"
import StatCard from "@/app/admin/components/StatCard"

describe("StatCard", () => {
  it("renders title/value", () => {
    render(<StatCard title="T" value="V" icon={<span>Icon</span>} />)
    expect(screen.getByText("T")).toBeInTheDocument()
    expect(screen.getByText("V")).toBeInTheDocument()
  })

  it("renders icon node", () => {
    render(<StatCard title="T" value="V" icon={<span data-testid="icon" />} />)
    expect(screen.getByTestId("icon")).toBeInTheDocument()
  })

  test.each(["0", "1", "999", "—"])("supports value %s", (v) => {
    render(<StatCard title="X" value={v} icon={<span />} />)
    expect(screen.getByText(v)).toBeInTheDocument()
  })
})