import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

let transporter = null

const getTransporter = () => {
  if (!env.smtp.host) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth:
        env.smtp.user && env.smtp.pass
          ? { user: env.smtp.user, pass: env.smtp.pass }
          : undefined,
    })
  }
  return transporter
}

export const sendEmail = async ({ to, subject, text, html }) => {
  const mailer = getTransporter()
  if (!mailer) {
    if (env.nodeEnv === 'production') {
      console.warn('[email] SMTP is not configured; email was not sent.')
    }
    return { delivered: false }
  }

  await mailer.sendMail({
    from: env.smtp.from,
    to,
    subject,
    text,
    html,
  })
  return { delivered: true }
}

export const buildClientUrl = (path) => `${env.clientUrl.replace(/\/$/, '')}${path}`
