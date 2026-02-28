import mongoose, { Schema, InferSchemaType } from "mongoose"

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    car: { type: Schema.Types.ObjectId, ref: "Car", required: true },

    packageId: { type: Schema.Types.ObjectId, ref: "Package", required: true },
    packageTitle: { type: String, required: true },
    category: { type: String, required: true },
    basePrice: { type: Number, required: true },

    durationMins: { type: Number, default: null },

    selectedOilType: { type: String, default: null },
    selectedAddons: { type: [String], default: [] },

    providerId: { type: Schema.Types.ObjectId, ref: "Provider", required: true },
    providerName: { type: String, required: true },

    totalPrice: { type: Number, required: true },

    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "PENDING_PAYMENT",
      required: true,
    },

    paidAt: { type: Date, default: null },
    
    transaction_uuid: { type: String, default: null, index: true },
    transaction_code: { type: String, default: null },
  },
  { timestamps: true }
)
export type IOrder = InferSchemaType<typeof OrderSchema>
export const OrderModel = mongoose.model("Order", OrderSchema)