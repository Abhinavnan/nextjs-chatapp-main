import { resendInternalMail } from '@/components/util/config/config';
import { EmailPayload } from '@/components/util/types';

interface AccountVerificationEmailTemplateProps {
    email: string;
    otp: number;
    name: string;
}

const accountVerificationEmailTemplate = ({ email, otp, name }: AccountVerificationEmailTemplateProps): EmailPayload => ({
    to: [email],
    from: resendInternalMail,
    subject: 'Account Verification',
    text: `Hi ${name},\n\nYour one-time password (OTP) for account verification is: ${otp}\n\nPlease use this OTP to verify your account. 
        This OTP is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nThank you,\nThe Chat App Team`,
    html: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Chat App account verification</title>
            <style>
            body {margin: 0; padding: 0; width: 100% !important; background-color: #f4f5f7; -webkit-font-smoothing: antialiased;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,Helvetica, Arial, sans-serif;}
            table {border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt;}
            td {padding: 0;}
            img {border: 0;}
            .wrapper { width: 100%; table-layout: fixed; background-color: #f4f5f7; padding-bottom: 40px; padding-top: 40px; }
            .main-table { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 500px; border-radius: 8px; 
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e1e4e8;}
            .content {padding: 32px 24px;}
            .header-title { font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 16px 0; }
            .body-text { font-size: 15px; line-height: 24px; color: #4b5563; margin: 0 0 24px 0; }
            .otp-container { background-color: #f3f4f6; border-radius: 6px; padding: 16px; text-align: center; margin-bottom: 24px; 
                letter-spacing: 4px; }
            .otp-code { font-size: 32px; font-weight: 800; color: #2563eb; margin: 0; }
            .footer-text { font-size: 13px; line-height: 18px; color: #9ca3af; margin: 0; }
            .divider { border-top: 1px solid #e5e7eb; margin: 24px 0; }
            </style>
        </head>
        <body>
            <center class="wrapper">
            <table class="main-table" role="presentation">
                <tr>
                <td class="content">
                    <!-- Header -->
                    <h1 class="header-title">Verify your account</h1>
                    <!-- Greeting -->
                    <p class="body-text">Hi ${name},</p>
                    <p class="body-text">
                        Please use the following one-time password (OTP) to complete your
                        verification process. This code is valid for
                        <strong>10 minutes</strong>.
                    </p>
                    <!-- OTP Box -->
                    <div class="otp-container">
                        <p class="otp-code">${otp}</p>
                    </div>
                    <!-- Security Warning -->
                    <p class="body-text" style="font-size: 14px; color: #6b7280">
                        If you did not request this verification, you can safely ignore
                        this email.
                    </p>
                    <div class="divider"></div>
                    <!-- Footer -->
                    <p class="footer-text">
                        Thank you,<br /><strong>The Chat App Team</strong>
                    </p>
                </td>
                </tr>
            </table>
            </center>
        </body>
    </html>`
});


export { accountVerificationEmailTemplate };