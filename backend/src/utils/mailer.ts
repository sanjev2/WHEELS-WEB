import nodemailer from "nodemailer"

export function makeTransport() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) throw new Error("GMAIL_USER / GMAIL_APP_PASSWORD not set")

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  })
}

export async function sendResetCodeEmail(to: string, code: string) {
  const from = process.env.GMAIL_FROM || process.env.GMAIL_USER
  const appName = process.env.APP_NAME || "Your App"
  const transporter = makeTransport()

  await transporter.sendMail({
    from,
    to,
    subject: `${appName} password reset code`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2 style="margin:0 0 12px">${appName}</h2>
        <p style="margin:0 0 8px">Use this verification code to reset your password:</p>
        <div style="font-size:24px;font-weight:700;letter-spacing:3px;margin:12px 0">${code}</div>
        <p style="margin:0 0 8px">This code expires in <b>10 minutes</b>.</p>
        <p style="margin:0;color:#666">If you didn’t request this, ignore this email.</p>
      </div>
    `,
  })
}
