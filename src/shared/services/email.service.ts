import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import envConfig from '../config';
import { promises as fs } from 'fs';

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
        const template = await fs.readFile('src/template/email.template.html', 'utf8');
        const emailContent = template
            .replace('{{introduce}}', 'Verify Your Email')
            .replace('{{user_receive}}', email)
            .replace('{{description}}', 'Please click the button below to verify your email address.')
            .replace('{{link}}', verificationLink)
            .replace('{{user_send}}', 'verification@support.twitter.com');

        await this.transporter.sendMail({
            from: envConfig.EMAIL_FROM,
            to: email,
            subject: 'Email Verification',
            html: emailContent,
        });
    }

    async sendPasswordResetEmail(email: string, token: string) {
        const resetLink = `${envConfig.CLIENT_URL}/reset-password?token=${token}`;
        const template = await fs.readFile('src/template/email.template.html', 'utf8');
        const emailContent = template
            .replace('{{introduce}}', 'Reset Your Password')
            .replace('{{user_receive}}', email)
            .replace('{{description}}', 'Please click the button below to reset your password.')
            .replace('{{link}}', resetLink)
            .replace('{{user_send}}', 'trongdn2405@gmail.com');

        await this.transporter.sendMail({
            from: envConfig.EMAIL_FROM,
            to: email,
            subject: 'Password Reset Request',
            html: emailContent,
        });
    }
}