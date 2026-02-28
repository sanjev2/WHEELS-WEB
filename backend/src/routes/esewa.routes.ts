import { Router } from "express"
import crypto from "crypto"
import axios from "axios"
import mongoose from "mongoose"
import { authMiddleware, type AuthRequest } from "../middleware/auth.middleware"
import { OrderModel } from "../models/order.model"

const router = Router()

// ===== CONFIG =====
const ESEWA_ENV = process.env.ESEWA_ENV || "uat"
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST"
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q"

const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000"
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000"

const ESEWA_FORM_URL =
  ESEWA_ENV === "prod"
    ? "https://epay.esewa.com.np/api/epay/main/v2/form"
    : "https://rc-epay.esewa.com.np/api/epay/main/v2/form"

const ESEWA_STATUS_URL =
  ESEWA_ENV === "prod"
    ? "https://epay.esewa.com.np/api/epay/transaction/status/"
    : "https://uat.esewa.com.np/api/epay/transaction/status/"

// ===== HELPERS =====
function hmacBase64(message: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(message).digest("base64")
}

function generateRequestSignature(total_amount: string, transaction_uuid: string, product_code: string) {
  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`
  return hmacBase64(message, ESEWA_SECRET_KEY)
}

function generateResponseSignature(payload: any) {
  const signedFields = String(payload?.signed_field_names || "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean)

  const message = signedFields.map((k: string) => `${k}=${payload[k]}`).join(",")
  return hmacBase64(message, ESEWA_SECRET_KEY)
}

function decodeEsewaData(dataB64: string) {
  const json = Buffer.from(dataB64, "base64").toString("utf8")
  return JSON.parse(json)
}

// ============================================================
// ✅ INITIATE PAYMENT (AUTH REQUIRED)
// POST /api/esewa/initiate
// ============================================================
router.post("/initiate", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" })

    const totalAmount = String(req.body?.total_amount || "").trim()
    const booking = req.body?.booking

    if (!totalAmount) return res.status(400).json({ success: false, message: "total_amount is required" })
    if (!booking) return res.status(400).json({ success: false, message: "booking is required" })

    const carId = String(booking.carId || "")
    const packageId = String(booking.packageId || "")
    const providerId = String(booking.providerId || "")

    if (!carId || !packageId || !providerId) {
      return res.status(400).json({ success: false, message: "booking missing carId/packageId/providerId" })
    }

    const transaction_uuid = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    const product_code = ESEWA_PRODUCT_CODE

    const amount = totalAmount
    const tax_amount = "0"
    const product_service_charge = "0"
    const product_delivery_charge = "0"
    const total_amount = totalAmount

    const signed_field_names = "total_amount,transaction_uuid,product_code"
    const signature = generateRequestSignature(total_amount, transaction_uuid, product_code)

    const success_url = `${API_BASE_URL}/api/esewa/success`
    const failure_url = `${API_BASE_URL}/api/esewa/failure`

    // ✅ Create PENDING order
    const createdOrder = await OrderModel.create({
      user: new mongoose.Types.ObjectId(userId),
      car: new mongoose.Types.ObjectId(carId),

      packageId: new mongoose.Types.ObjectId(packageId),
      packageTitle: String(booking.packageTitle || "Service Package"),
      category: String(booking.category || "general"),
      basePrice: Number(booking.basePrice || 0),

      durationMins: booking.durationMins ?? null,
      selectedOilType: booking.selectedOilType ?? null,
      selectedAddons: Array.isArray(booking.selectedAddons) ? booking.selectedAddons : [],

      providerId: new mongoose.Types.ObjectId(providerId),
      providerName: String(booking.providerName || "Provider"),

      totalPrice: Number(booking.totalPrice || total_amount),

      status: "PENDING_PAYMENT",
      paidAt: null,

      transaction_uuid: transaction_uuid,
      transaction_code: null,
    })

    console.log("✅ ESEWA INITIATE: order created", {
      orderId: createdOrder._id.toString(),
      transaction_uuid,
      total_amount,
    })

    return res.json({
      success: true,
      data: {
        orderId: createdOrder._id,
        transaction_uuid,
        esewaUrl: ESEWA_FORM_URL,
        fields: {
          amount,
          tax_amount,
          total_amount,
          transaction_uuid,
          product_code,
          product_service_charge,
          product_delivery_charge,
          success_url,
          failure_url,
          signed_field_names,
          signature,
        },
      },
    })
  } catch (e: any) {
    console.error("❌ ESEWA INITIATE ERROR:", e?.message)
    return res.status(500).json({ success: false, message: e.message || "Internal Server Error" })
  }
})

// ============================================================
// ✅ SUCCESS CALLBACK
// GET /api/esewa/success?data=base64
// ============================================================
router.get("/success", async (req, res) => {
  try {
    const data = String(req.query?.data || "")
    if (!data) {
      console.log("❌ ESEWA SUCCESS: missing data")
      return res.redirect(`${APP_BASE_URL}/dashboard/services/payment?status=MISSING_DATA`)
    }

    const payload = decodeEsewaData(data)

    console.log("✅ ESEWA SUCCESS payload:", payload)

    // 1) verify signature
    const expectedSig = generateResponseSignature(payload)
    if (expectedSig !== payload.signature) {
      console.log("❌ ESEWA SUCCESS: bad signature")
      return res.redirect(`${APP_BASE_URL}/dashboard/services/payment?status=BAD_SIGNATURE`)
    }

    const product_code = String(payload.product_code || "")
    const total_amount = String(payload.total_amount || "")
    const transaction_uuid = String(payload.transaction_uuid || "")
    const transaction_code = String(payload.transaction_code || "")
    const payloadStatus = String(payload.status || "")

    // 2) find order first
    const existing = await OrderModel.findOne({ transaction_uuid })
    console.log("✅ Order found by transaction_uuid?", !!existing)

    if (!existing) {
      console.log("❌ ORDER_NOT_FOUND for transaction_uuid:", transaction_uuid)
      return res.redirect(`${APP_BASE_URL}/dashboard/services/payment?status=ORDER_NOT_FOUND`)
    }

    // 3) call status check (recommended)
    let finalStatus = "UNKNOWN"
    try {
      const url = new URL(ESEWA_STATUS_URL)
      url.searchParams.set("product_code", product_code)
      url.searchParams.set("total_amount", total_amount)
      url.searchParams.set("transaction_uuid", transaction_uuid)

      const { data: statusData } = await axios.get(url.toString(), { timeout: 10000 })
      finalStatus = String(statusData?.status || "UNKNOWN")

      console.log("✅ Status check result:", statusData)
    } catch (err: any) {
      console.log("⚠️ Status check failed, using payload.status fallback:", err?.message)
      // fallback for testing: use payload status if status API fails
      finalStatus = payloadStatus || "STATUS_CHECK_FAILED"
    }

    if (finalStatus !== "COMPLETE") {
      console.log("❌ Payment not COMPLETE:", finalStatus)
      return res.redirect(`${APP_BASE_URL}/dashboard/services/payment?status=${encodeURIComponent(finalStatus)}`)
    }

    // 4) mark PAID
    existing.status = "PAID"
    existing.paidAt = new Date()
    ;(existing as any).transaction_code = transaction_code || null
    await existing.save()

    console.log("✅ Order marked PAID:", existing._id.toString())

    return res.redirect(`${APP_BASE_URL}/dashboard/orders?paid=1`)
  } catch (e: any) {
    console.log("❌ ESEWA SUCCESS ERROR:", e?.message)
    return res.redirect(`${APP_BASE_URL}/dashboard/services/payment?status=SERVER_ERROR`)
  }
})

// ============================================================
// FAILURE CALLBACK
// ============================================================
router.get("/failure", async (_req, res) => {
  return res.redirect(`${APP_BASE_URL}/dashboard/services/payment?status=FAILED`)
})

export default router