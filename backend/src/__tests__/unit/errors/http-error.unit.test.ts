import { HttpError } from "../../../errors/http-error"

describe("HttpError", () => {

  test("should create error with statusCode and message", () => {
    const error = new HttpError(400, "Bad Request")

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(HttpError)

    expect(error.statusCode).toBe(400)
    expect(error.message).toBe("Bad Request")
  })

  test("should work with different status codes", () => {
    const error = new HttpError(404, "Not Found")

    expect(error.statusCode).toBe(404)
    expect(error.message).toBe("Not Found")
  })

})