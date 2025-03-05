import { Injectable } from '@nestjs/common'
import { createTransport } from 'nodemailer'
import envConfig from '../config'
import { promises as fs } from 'fs'

@Injectable()
export class EmailService {
  private transporter

  constructor() {
    this.transporter = createTransport({
      host: envConfig.EMAIL_HOST,
      port: envConfig.EMAIL_PORT,
      auth: {
        user: envConfig.EMAIL_USER,
        pass: envConfig.EMAIL_PASSWORD,
      },
    })
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationLink = `${envConfig.CLIENT_URL}/verify-email?token=${token}`
    const template = await fs.readFile('src/template/email.template.html', 'utf8')
    const emailContent = template
      .replace(/{{title}}/g, 'Email Verification')
      .replace(/{{introduce}}/g, 'Verify Your Email')
      .replace(/{{user_receive}}/g, email)
      .replace(/{{description}}/g, 'Please click the button below to verify your email address.')
      .replace(/{{link}}/g, verificationLink)
      .replace(/{{user_send}}/g, 'doanvvantrong@support.dtu.com')

    await this.transporter.sendMail({
      from: envConfig.EMAIL_FROM,
      to: email,
      subject: 'Email Verification',
      html: emailContent,
    })
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${envConfig.CLIENT_URL}/reset-password?token=${token}`
    const template = await fs.readFile('src/template/email.template.html', 'utf8')
    const emailContent = template
      .replace(/{{title}}/g, 'Password Reset')
      .replace(/{{introduce}}/g, 'Reset Your Password')
      .replace(/{{user_receive}}/g, email)
      .replace(/{{description}}/g, 'Please click the button below to reset your password.')
      .replace(/{{link}}/g, resetLink)
      .replace(/{{user_send}}/g, 'doanvvantrong@support.dtu.com')

    await this.transporter.sendMail({
      from: envConfig.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Request',
      html: emailContent,
    })
  }
}
