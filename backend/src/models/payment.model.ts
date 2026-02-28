import mongoose, { Schema, type Document } from "mongoose"

export interface IEsewaPayment extends Document {
  userId: string
  transaction_uuid: string
  total_amount: number
  status: "PENDING" | "COMPLETE" | "FAILED"
  booking: any
  transaction_code?: string | null
  createdAt: Date
  updatedAt: Date
}

const EsewaPaymentSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    transaction_uuid: { type: String, required: true, unique: true, index: true },
    total_amount: { type: Number, required: true },
    status: { type: String, enum: ["PENDING", "COMPLETE", "FAILED"], default: "PENDING" },
    booking: { type: Schema.Types.Mixed, required: true },
    transaction_code: { type: String, default: null },
  },
  { timestamps: true }
)

export const EsewaPaymentModel = mongoose.model<IEsewaPayment>("EsewaPayment", EsewaPaymentSchema)