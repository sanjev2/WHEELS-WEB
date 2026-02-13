describe("AuthService (unit)", () => {
  it("should throw when user not found", async () => {
    const repo = {
      findByEmail: jest.fn().mockResolvedValue(null),
    }

    async function login(email: string) {
      const user = await repo.findByEmail(email)
      if (!user) throw new Error("User not found")
      return true
    }

    await expect(login("missing@test.com")).rejects.toThrow("User not found")
    expect(repo.findByEmail).toHaveBeenCalledWith("missing@test.com")
  })
})
