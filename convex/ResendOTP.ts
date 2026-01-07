import { Email } from "@convex-dev/auth/providers/Email";
import { Resend as ResendAPI } from "resend";

export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    // Generate 8-digit OTP
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    const alphabet = "0123456789";
    return Array.from(array)
      .map((byte) => alphabet[byte % alphabet.length])
      .join("");
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: process.env.AUTH_RESEND_FROM ?? "DEVSA <noreply@send.devsa.community>",
      to: [email],
      subject: "Your DEVSA sign-in code",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: -96px;">
            <img src="https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-8-hero+(1).png" alt="DEVSA" style="width: 100%; max-width: 500px; height: auto;" />
          </div>
          
          <div style="background: #f9fafb; border-radius: 12px; padding: 32px; text-align: center;">
            <h2 style="color: #111827; font-size: 20px; margin: 0 0 16px;">Your sign-in code</h2>
            <p style="color: #6b7280; margin: 0 0 24px;">Enter this code to sign in to your DEVSA account.</p>
            
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 16px 32px; display: inline-block;">
              <span style="font-family: monospace; font-size: 32px; font-weight: 700; color: #111827; letter-spacing: 4px;">${token}</span>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px; margin-top: 24px;">
              This code expires in 15 minutes. If you didn't request this, you can safely ignore it.
            </p>
          </div>
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 32px;">
            © ${new Date().getFullYear()} DEVSA Community. San Antonio, TX.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(JSON.stringify(error));
    }
  },
});
