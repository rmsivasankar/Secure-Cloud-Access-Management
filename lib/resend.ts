import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTP = async (email: string, otp: string) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://pure4runner.com/images/pureumbrella.jpg" alt="Umbrella Corporation" style="max-width: 150px; height: auto;">
      </div>
      <h2 style="color: #ff0000; text-align: center;">Security Verification Code</h2>
      <p>For your security, we require additional verification. Please use the following code to complete your login:</p>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
        ${otp}
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not request this code, please contact security immediately as your account may be at risk.</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #666;">
        <p>© ${new Date().getFullYear()} Umbrella Corporation. All rights reserved.</p>
        <p>This is an automated message. Please do not reply.</p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Umbrella Security <send@panimalar.in>",
      to: email,
      subject: "Your Umbrella Corporation Security Code",
      html: htmlContent,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error("Failed to send email via Resend");
    }

    return data;
  } catch (error) {
    console.error("Error sending OTP via Resend:", error);
    throw error;
  }
};
