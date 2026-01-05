import mongoose, { type Document, Schema } from "mongoose"
import type { UserType } from "../types/user.type"

const UserSchema: Schema = new Schema<UserType>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user', 
    },
  },
  {
    timestamps: true,
  },
)

export interface IUser extends UserType, Document {
  _id: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export const UserModel = mongoose.model<IUser>("Use", UserSchema)

