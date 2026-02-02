import type { CreateUserDTO, LoginUserDTO, AdminCreateUserDTO } from "../dtos/user.dto"
import { UserRepository } from "../repositories/user.repositories"
import bcryptjs from "bcryptjs"
import { HttpError } from "../errors/http-error"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config"
import type { IUser } from "../models/user.model"

const userRepository = new UserRepository()

export class UserService {
  // ✅ PUBLIC SIGNUP
  async createUser(data: CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email)
    if (emailCheck) throw new HttpError(403, "Email already in use")

    const hashedPassword = await bcryptjs.hash(data.password, 10)

    const userToSave: Partial<IUser> = {
      name: data.name,
      email: data.email,
      contact: data.contact,
      address: data.address,
      password: hashedPassword,
      role: "user", // ✅ force user
      profile_picture: null,
    }

    return await userRepository.createUser(userToSave)
  }

  // ✅ ADMIN CREATE USER (supports optional profile_picture from Multer)
  async createUserAsAdmin(data: AdminCreateUserDTO & { profile_picture?: string | null }) {
    const emailCheck = await userRepository.getUserByEmail(data.email)
    if (emailCheck) throw new HttpError(403, "Email already in use")

    const hashedPassword = await bcryptjs.hash(data.password, 10)

    const userToSave: Partial<IUser> = {
      name: data.name,
      email: data.email,
      contact: data.contact,
      address: data.address,
      password: hashedPassword,
      role: data.role ?? "user",
      profile_picture: data.profile_picture ?? null, // ✅ accept uploaded filename
    }

    return await userRepository.createUser(userToSave)
  }

  // ✅ LOGIN
  async loginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email)
    if (!user) throw new HttpError(404, "User not found")

    const validPassword = await bcryptjs.compare(data.password, user.password)
    if (!validPassword) throw new HttpError(401, "Invalid credentials")

    const payload = {
      userId: String(user._id),
      email: user.email,
      role: user.role || "user",
    }

    const token = jwt.sign(payload, JWT_SECRET as string, { expiresIn: "30d" })
    return { token, user }
  }

  // ✅ ME
  async getMe(userId: string) {
    const user = await userRepository.getUserById(userId)
    if (!user) throw new HttpError(404, "User not found")
    return user
  }

  // ✅ PROFILE PICTURE (self upload endpoint)
  async setProfilePicture(userId: string, filename: string) {
    const updated = await userRepository.updateProfilePicture(userId, filename)
    if (!updated) throw new HttpError(404, "User not found")
    return updated
  }

  // ✅ Admin helpers
  async getAllUsers() {
    return await userRepository.getAllUsers()
  }

  async getUserById(id: string) {
    const user = await userRepository.getUserById(id)
    if (!user) throw new HttpError(404, "User not found")
    return user
  }

  /**
   * ✅ Update user (used by BOTH):
   * - PUT /api/admin/users/:id (admin)
   * - PUT /api/auth/:id (self OR admin)
   *
   * Rules enforced here:
   * - password cannot be updated from this endpoint
   * - confirmPassword ignored
   * - role cannot be changed via update (admin should have separate endpoint if needed)
   */
  async updateUserById(id: string, updates: any) {
    if (!updates || typeof updates !== "object") updates = {}

    // ✅ strip forbidden fields
    if (updates.password) delete updates.password
    if (updates.confirmPassword) delete updates.confirmPassword
    if (updates.role) delete updates.role

    // ✅ optional: strip empty strings (helps when using multipart/form-data)
    Object.keys(updates).forEach((k) => {
      if (updates[k] === "") delete updates[k]
    })

    const updated = await userRepository.updateUser(id, updates)
    if (!updated) throw new HttpError(404, "User not found")
    return updated
  }

  async deleteUserById(id: string) {
    const deleted = await userRepository.deleteUser(id)
    if (!deleted) throw new HttpError(404, "User not found")
    return true
  }
}
