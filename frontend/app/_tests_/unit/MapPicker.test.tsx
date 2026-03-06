import { render, screen } from "@testing-library/react"
import MapPicker from "@/app/admin/components/MapPicker"

jest.mock("leaflet", () => ({
  Icon: function Icon(this: any) {
    return {}
  },
}))

jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }: any) => <div data-testid="map">{children}</div>,
  TileLayer: () => <div data-testid="tile" />,
  Marker: ({ position }: any) => <div data-testid="marker">{JSON.stringify(position)}</div>,
  useMapEvents: () => null,
}))

describe("MapPicker", () => {
  it("renders map container", () => {
    render(<MapPicker lat={1} lng={2} onChange={() => {}} />)
    expect(screen.getByTestId("map")).toBeInTheDocument()
  })

  it("renders tile", () => {
    render(<MapPicker lat={1} lng={2} onChange={() => {}} />)
    expect(screen.getByTestId("tile")).toBeInTheDocument()
  })

  it("renders marker", () => {
    render(<MapPicker lat={1} lng={2} onChange={() => {}} />)
    expect(screen.getByTestId("marker")).toBeInTheDocument()
  })

  test.each([
    [0, 0],
    [27.7, 85.3],
    [-10, 150],
  ])("marker position reflects lat/lng %p", (lat, lng) => {
    render(<MapPicker lat={lat as number} lng={lng as number} onChange={() => {}} />)
    expect(screen.getByTestId("marker")).toHaveTextContent(String(lat))
    expect(screen.getByTestId("marker")).toHaveTextContent(String(lng))
  })
})