import mongoose from "mongoose"
import { UserModel, type IUser } from "../models/user.model"

export interface IUserRepository {
  getUserByEmail(email: string): Promise<IUser | null>
  createUser(userData: Partial<IUser>): Promise<IUser>
  getUserById(id: string): Promise<IUser | null>
  getAllUsers(): Promise<IUser[]>

  // ✅ pagination
  getAllUsersPaginated(params: {
    page: number
    limit: number
    search?: string
  }): Promise<{
    users: IUser[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }>

  updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>
  deleteUser(id: string): Promise<boolean>

  updateProfilePicture(id: string, filename: string): Promise<IUser | null>

  // ✅ RESET PASSWORD METHODS (missing in your file)
  updateResetFieldsByEmail(email: string, updates: any): Promise<IUser | null>
  findByResetTokenHash(tokenHash: string): Promise<IUser | null>
  updateUserPasswordById(id: string, password: string): Promise<IUser | null>
}

export class UserRepository implements IUserRepository {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData)
    return await user.save()
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email })
  }

  async getUserById(id: string): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null
    return await UserModel.findById(id)
  }

  async getAllUsers(): Promise<IUser[]> {
    return await UserModel.find()
  }

  // ✅ REAL DATABASE PAGINATION + SEARCH
  async getAllUsersPaginated(params: { page: number; limit: number; search?: string }) {
    const page = Math.max(1, params.page || 1)
    const limit = Math.min(50, Math.max(1, params.limit || 10))
    const skip = (page - 1) * limit

    const search = (params.search || "").trim()
    const filter: any = {}

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { contact: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ]
    }

    const [users, total] = await Promise.all([
      UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      UserModel.countDocuments(filter),
    ])

    const totalPages = Math.max(1, Math.ceil(total / limit))

    return {
      users,
      pagination: { page, limit, total, totalPages },
    }
  }

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null
    return await UserModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
  }

  async deleteUser(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false
    const result = await UserModel.findByIdAndDelete(id)
    return !!result
  }

  async updateProfilePicture(id: string, filename: string): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null

    return await UserModel.findByIdAndUpdate(
      id,
      { $set: { profile_picture: filename } },
      { new: true, runValidators: true }
    )
  }

  // ✅ RESET PASSWORD METHODS
  async updateResetFieldsByEmail(email: string, updates: any): Promise<IUser | null> {
    return await UserModel.findOneAndUpdate({ email }, { $set: updates }, { new: true, runValidators: true })
  }

  async findByResetTokenHash(tokenHash: string): Promise<IUser | null> {
    return await UserModel.findOne({ reset_token_hash: tokenHash })
  }

  async updateUserPasswordById(id: string, password: string): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null
    return await UserModel.findByIdAndUpdate(id, { $set: { password } }, { new: true, runValidators: true })
  }
}
