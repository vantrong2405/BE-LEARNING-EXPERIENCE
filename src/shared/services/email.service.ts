import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import envConfig from '../config';

@Injectable()
export class EmailService {
    private transporter;

    constructor() {
        this.transporter = createTransport({
            host: envConfig.EMAIL_HOST,
            port: envConfig.EMAIL_PORT,
            auth: {
                user: envConfig.EMAIL_USER,
                pass: envConfig.EMAIL_PASSWORD,
            },
        });
    }

    async sendVerificationEmail(email: string, token: string) {
        const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

        await this.transporter.sendMail({
            from: envConfig.EMAIL_FROM,
            to: email,
            subject: 'Email Verification',
            html: `
                <h1>Verify Your Email</h1>
                <p>Please click the link below to verify your email address:</p>
                <a href="${verificationLink}">Verify Email</a>
                <p>This link will expire in 24 hours.</p>
            `,
        });
    }

    async sendResetPasswordEmail(email: string, token: string) {
        const resetLink = `${process.env.CLIENT_URL}/auth/reset-password?token=${token}`;

        await this.transporter.sendMail({
            from: envConfig.EMAIL_FROM,
            to: email,
            subject: 'Forgot Password',
            html: `
                <h1>Reset Your Password</h1>
                <p>Dear User,</p>
                <p>We received a request to reset your password. Don't worry, we've got you covered!</p>
                <p>Click the button below to set a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
                </div>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <p>Best regards,<br>Dovianorith Team</p>
            `,
        });
    }
}