import type { CreateUserDTO, LoginUserDTO, AdminCreateUserDTO } from "../dtos/user.dto"
import { UserRepository } from "../repositories/user.repositories"
import bcryptjs from "bcryptjs"
import { HttpError } from "../errors/http-error"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config"
import type { IUser } from "../models/user.model"

import crypto from "crypto"
import nodemailer from "nodemailer"

const userRepository = new UserRepository()

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex")
}

function random6DigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function randomToken() {
  return crypto.randomBytes(32).toString("hex")
}

export class UserService {
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
      role: "user",
      profile_picture: null,
    }

    return await userRepository.createUser(userToSave)
  }

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
      profile_picture: data.profile_picture ?? null,
    }

    return await userRepository.createUser(userToSave)
  }

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

  async getMe(userId: string) {
    const user = await userRepository.getUserById(userId)
    if (!user) throw new HttpError(404, "User not found")
    return user
  }

  async setProfilePicture(userId: string, filename: string) {
    const updated = await userRepository.updateProfilePicture(userId, filename)
    if (!updated) throw new HttpError(404, "User not found")
    return updated
  }

  async getAllUsers() {
    return await userRepository.getAllUsers()
  }

  async getAllUsersPaginated(params: { page: number; limit: number; search?: string }) {
    return await userRepository.getAllUsersPaginated(params)
  }

  async getUserById(id: string) {
    const user = await userRepository.getUserById(id)
    if (!user) throw new HttpError(404, "User not found")
    return user
  }

  async updateUserById(id: string, updates: any) {
    if (!updates || typeof updates !== "object") updates = {}

    if (updates.password) delete updates.password
    if (updates.confirmPassword) delete updates.confirmPassword
    if (updates.role) delete updates.role

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

  // ============================================================
  // ✅ CHANGE PASSWORD (LOGGED-IN SETTINGS FLOW)
  // ============================================================
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const uid = String(userId || "").trim()
    const current = String(currentPassword || "").trim()
    const next = String(newPassword || "").trim()

    if (!uid) throw new HttpError(401, "Unauthorized")
    if (!current || !next) throw new HttpError(400, "Current password and new password are required")
    if (next.length < 6) throw new HttpError(400, "Password must be at least 6 characters")
    if (current === next) throw new HttpError(400, "New password must be different from current password")

    const user = await userRepository.getUserById(uid)
    if (!user) throw new HttpError(404, "User not found")

    const valid = await bcryptjs.compare(current, user.password)
    if (!valid) throw new HttpError(401, "Current password is incorrect")

    const hashed = await bcryptjs.hash(next, 10)

    const updated = await userRepository.updateUserPasswordById(uid, hashed)
    if (!updated) throw new HttpError(404, "User not found")

    // ✅ optional: clean reset fields (good practice)
    await userRepository.updateResetFieldsByEmail(user.email, {
      reset_token_hash: null,
      reset_token_expires_at: null,
      reset_code_hash: null,
      reset_code_attempts: 0,
      reset_code_expires_at: null,
      reset_last_sent_at: null,
    })
  }

  // ============================================================
  // ✅ FORGOT PASSWORD FLOW
  // ============================================================

  async requestPasswordReset(email: string): Promise<{ cooldownSeconds: number }> {
    const cleanEmail = String(email || "").trim().toLowerCase()
    if (!cleanEmail) return { cooldownSeconds: 60 }

    const user = await userRepository.getUserByEmail(cleanEmail)
    if (!user) return { cooldownSeconds: 60 } // privacy

    const now = new Date()

    const lastSent = (user as any).reset_last_sent_at as Date | undefined
    if (lastSent) {
      const diffMs = now.getTime() - new Date(lastSent).getTime()
      const cooldownMs = 60_000
      if (diffMs < cooldownMs) {
        const cooldownSeconds = Math.ceil((cooldownMs - diffMs) / 1000)
        return { cooldownSeconds }
      }
    }

    const code = random6DigitCode()
    const codeHash = sha256(code)

    await userRepository.updateResetFieldsByEmail(cleanEmail, {
      reset_code_hash: codeHash,
      reset_code_attempts: 0,
      reset_code_expires_at: new Date(now.getTime() + 10 * 60 * 1000),
      reset_last_sent_at: now,
      reset_token_hash: null,
      reset_token_expires_at: null,
    })

    await this.sendResetCodeEmail(cleanEmail, code)

    return { cooldownSeconds: 60 }
  }

  async verifyPasswordResetCode(email: string, code: string): Promise<{ resetToken: string }> {
    const cleanEmail = String(email || "").trim().toLowerCase()
    const cleanCode = String(code || "").trim()

    if (!cleanEmail || !cleanCode) throw new HttpError(400, "Email and code are required")

    const user = await userRepository.getUserByEmail(cleanEmail)
    if (!user) throw new HttpError(401, "Invalid code")

    const expiresAt = (user as any).reset_code_expires_at as Date | undefined
    const codeHash = (user as any).reset_code_hash as string | null
    const attempts = Number((user as any).reset_code_attempts || 0)

    if (!codeHash || !expiresAt) throw new HttpError(401, "Invalid code")
    if (attempts >= 5) throw new HttpError(429, "Too many attempts. Please request a new code.")
    if (new Date(expiresAt).getTime() < Date.now()) throw new HttpError(401, "Code expired")

    const incomingHash = sha256(cleanCode)
    if (incomingHash !== codeHash) {
      await userRepository.updateResetFieldsByEmail(cleanEmail, { reset_code_attempts: attempts + 1 })
      throw new HttpError(401, "Invalid code")
    }

    const resetToken = randomToken()
    const tokenHash = sha256(resetToken)

    await userRepository.updateResetFieldsByEmail(cleanEmail, {
      reset_token_hash: tokenHash,
      reset_token_expires_at: new Date(Date.now() + 15 * 60 * 1000),
      reset_code_hash: null,
      reset_code_attempts: 0,
      reset_code_expires_at: null,
    })

    return { resetToken }
  }

  async resetPasswordWithToken(resetToken: string, newPassword: string): Promise<void> {
    const token = String(resetToken || "").trim()
    const pwd = String(newPassword || "").trim()

    if (!token || !pwd) throw new HttpError(400, "Reset token and new password are required")
    if (pwd.length < 6) throw new HttpError(400, "Password must be at least 6 characters")

    const tokenHash = sha256(token)
    const user = await userRepository.findByResetTokenHash(tokenHash)

    if (!user) throw new HttpError(401, "Invalid or expired token")

    const tokenExpires = (user as any).reset_token_expires_at as Date | undefined
    if (!tokenExpires || new Date(tokenExpires).getTime() < Date.now()) {
      throw new HttpError(401, "Invalid or expired token")
    }

    const hashedPassword = await bcryptjs.hash(pwd, 10)
    const updated = await userRepository.updateUserPasswordById(String(user._id), hashedPassword)
    if (!updated) throw new HttpError(404, "User not found")

    await userRepository.updateResetFieldsByEmail(user.email, {
      reset_token_hash: null,
      reset_token_expires_at: null,
      reset_code_hash: null,
      reset_code_attempts: 0,
      reset_code_expires_at: null,
      reset_last_sent_at: null,
    })
  }

  private async sendResetCodeEmail(to: string, code: string) {
    const hostUser = process.env.GMAIL_USER
    const hostPass = process.env.GMAIL_APP_PASSWORD

    if (!hostUser || !hostPass) {
      throw new HttpError(500, "Email not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD in .env")
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: hostUser,
        pass: hostPass,
      },
    })

    await transporter.sendMail({
      from: `WHEELS <${hostUser}>`,
      to,
      subject: "WHEELS - Password Reset Code",
      text: `Your WHEELS password reset code is: ${code}\n\nThis code expires in 10 minutes.`,
    })
  }
}