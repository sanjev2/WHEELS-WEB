jest.mock("../../../services/provider.service", () => {
  const mocks = {
    listAdmin: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }
  return { __esModule: true, __mocks: mocks, ProviderService: jest.fn().mockImplementation(() => mocks) }
})

import { AdminProvidersController } from "../../../controllers/admin.provider.controller"
import { mockReq, mockRes } from "../test-helpers"

const providerMocks = require("../../../services/provider.service").__mocks as {
  listAdmin: jest.Mock
  create: jest.Mock
  update: jest.Mock
  remove: jest.Mock
}

describe("AdminProvidersController (unit)", () => {
  const controller = new AdminProvidersController()
  beforeEach(() => jest.clearAllMocks())

  it("list returns 200", async () => {
    providerMocks.listAdmin.mockResolvedValue([{ _id: "1" }])
    const res = mockRes()
    await controller.list(mockReq() as any, res as any)
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it("create returns 400 when DTO invalid", async () => {
    const req = mockReq({ body: {} })
    const res = mockRes()

    await controller.create(req as any, res as any)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(providerMocks.create).not.toHaveBeenCalled()
  })

  it("create returns 201 when valid", async () => {
    providerMocks.create.mockResolvedValue({ _id: "p1" })
    const req = mockReq({
      body: {
        name: "Garage A",
        openFrom: "09:00",
        openTo: "18:00",
        lat: 27.7,
        lng: 85.3,
      },
    })
    const res = mockRes()

    await controller.create(req as any, res as any)

    expect(res.status).toHaveBeenCalledWith(201)
  })

  it("update returns 400 when DTO invalid", async () => {
    const req = mockReq({ params: { id: "1" }, body: { name: "" } })
    const res = mockRes()

    await controller.update(req as any, res as any)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it("update returns 200 when valid", async () => {
    providerMocks.update.mockResolvedValue({ _id: "1" })
    const req = mockReq({
      params: { id: "1" },
      body: {
        name: "Garage B",
        openFrom: "10:00",
        openTo: "19:00",
        lat: 27.7,
        lng: 85.3,
      },
    })
    const res = mockRes()

    await controller.update(req as any, res as any)

    expect(res.status).toHaveBeenCalledWith(200)
  })

  it("remove returns 200", async () => {
    providerMocks.remove.mockResolvedValue(undefined)
    const req = mockReq({ params: { id: "1" } })
    const res = mockRes()

    await controller.remove(req as any, res as any)

    expect(res.status).toHaveBeenCalledWith(200)
  })
})