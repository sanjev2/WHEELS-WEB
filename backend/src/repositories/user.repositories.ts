import mongoose from "mongoose"
import { UserModel, type IUser } from "../models/user.model"

export interface IUserRepository {
  getUserByEmail(email: string): Promise<IUser | null>
  createUser(userData: Partial<IUser>): Promise<IUser>
  getUserById(id: string): Promise<IUser | null>
  getAllUsers(): Promise<IUser[]>
  updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>
  deleteUser(id: string): Promise<boolean>

  updateProfilePicture(id: string, filename: string): Promise<IUser | null>
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

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null

    // ✅ IMPORTANT: use $set + runValidators
    return await UserModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
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
}
