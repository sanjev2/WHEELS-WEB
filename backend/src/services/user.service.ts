import type { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto"
import { UserRepository } from "../repositories/user.repositories"
import bcryptjs from "bcryptjs"
import { HttpError } from "../errors/http-error"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config"

const userRepository = new UserRepository()

export class UserService {
  async createUser(data: CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email)
    if (emailCheck) {
      throw new HttpError(403, "Email already in use")
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10)
    data.password = hashedPassword

    const userToSave = {
    name: data.name,
    email: data.email,
    contact: data.contact,
    address: data.address,
    password: hashedPassword,
    role: data.role ?? 'user', 
  
  }

    const newUser = await userRepository.createUser(userToSave)
    return newUser
  }

  async loginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email)
    if (!user) {
      throw new HttpError(404, "User not found")
    }

    const validPassword = await bcryptjs.compare(data.password, user.password)
    if (!validPassword) {
      throw new HttpError(401, "Invalid credentials")
    }
    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      contact: user.contact,
      address: user.address,
      role: user.role || 'user',
    }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" })
    return { token, user }
  }
}
