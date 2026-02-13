import mongoose, { type Document, Schema } from "mongoose"

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    profile_picture: { type: String, default: null },

    // ✅ PASSWORD RESET FIELDS
    reset_code_hash: { type: String, default: null },
    reset_code_expires_at: { type: Date, default: null },
    reset_code_attempts: { type: Number, default: 0 },
    reset_token_hash: { type: String, default: null },
    reset_token_expires_at: { type: Date, default: null },
    reset_last_sent_at: { type: Date, default: null },
  },
  { timestamps: true }
)

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  contact: string
  address: string
  password: string
  role: "user" | "admin"
  profile_picture?: string | null

  reset_code_hash?: string | null
  reset_code_expires_at?: Date | null
  reset_code_attempts?: number
  reset_token_hash?: string | null
  reset_token_expires_at?: Date | null
  reset_last_sent_at?: Date | null

  createdAt: Date
  updatedAt: Date
}

export const UserModel = mongoose.model<IUser>("User", UserSchema)
