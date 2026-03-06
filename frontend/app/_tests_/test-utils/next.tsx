// app/_tests_/test-utils/next.ts
import React from "react"

// next/navigation mocks
export const mockReplace = jest.fn()
export const mockPush = jest.fn()
export const mockBack = jest.fn()
export const mockPrefetch = jest.fn()

let _pathname = "/"
let _params: Record<string, any> = {}

export const setMockPathname = (p: string) => {
  _pathname = p
}
export const setMockParams = (p: Record<string, any>) => {
  _params = p
}

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
    back: mockBack,
    prefetch: mockPrefetch,
  }),
  usePathname: () => _pathname,
  useParams: () => _params,
}))

// next/link -> render as normal <a>
jest.mock("next/link", () => {
  return function Link(props: any) {
    const { href, children, ...rest } = props
    const resolvedHref =
      typeof href === "string" ? href : href?.pathname ?? ""
    return React.createElement("a", { href: resolvedHref, ...rest }, children)
  }
})

// next/dynamic -> return component immediately in tests
jest.mock("next/dynamic", () => {
  return () => {
    return function DynamicComponent(props: any) {
      return React.createElement("div", props)
    }
  }
})
export { setMockPathname as setPathname }
export { setMockParams as setParams }