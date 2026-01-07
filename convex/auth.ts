import { convexAuth } from "@convex-dev/auth/server";
import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Resend({
      id: "resend",
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.AUTH_RESEND_FROM ?? "DEVSA <noreply@devsa.community>",
      async sendVerificationRequest({ identifier: email, url }) {
        const resend = new ResendAPI(process.env.AUTH_RESEND_KEY);
        
        const { error } = await resend.emails.send({
          from: process.env.AUTH_RESEND_FROM ?? "DEVSA <noreply@devsa.community>",
          to: [email],
          subject: "Sign in to DEVSA Community",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="text-align: center; margin-bottom: -96px;">
                <img src="https://devsa-assets.s3.us-east-2.amazonaws.com/flyers-8-hero+(1).png" alt="DEVSA" style="width: 100%; max-width: 500px; height: auto;" />
              </div>
              
              <div style="background: #f9fafb; border-radius: 12px; padding: 32px; text-align: center;">
                <h2 style="color: #111827; font-size: 20px; margin: 0 0 16px;">Sign in to your account</h2>
                <p style="color: #6b7280; margin: 0 0 24px;">Click the button below to sign in. This link expires in 24 hours.</p>
                
                <a href="${url}" style="display: inline-block; background: #ef426f; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Sign In to DEVSA
                </a>
                
                <p style="color: #9ca3af; font-size: 14px; margin-top: 24px;">
                  If you didn't request this email, you can safely ignore it.
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
    }),
  ],
});
