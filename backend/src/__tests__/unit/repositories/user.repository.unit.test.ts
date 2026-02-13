describe("UserRepository (unit)", () => {
  it("example: should call Model.findOne with email", async () => {
    // This is a template
    // You need to replace UserModel and repository with your real files

    const findOneMock = jest.fn().mockResolvedValue({ _id: "1", email: "a@test.com" })

    // example fake model
    const UserModel = { findOne: findOneMock }

    // example repository function
    async function findByEmail(email: string) {
      return UserModel.findOne({ email })
    }

    const user = await findByEmail("a@test.com")
    expect(findOneMock).toHaveBeenCalledWith({ email: "a@test.com" })
    expect(user.email).toBe("a@test.com")
  })
})
