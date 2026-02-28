import { transporter } from "../../index.mjs";

const emailWrapper = (content) => `
  <div style="background-color: #f0f2f5; padding: 40px 20px; font-family: 'Segoe UI', Arial, sans-serif;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #4CAF50, #2E7D32); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">TodoApp</h1>
      </div>
      <div style="padding: 32px 28px;">
        ${content}
      </div>
      <div style="background-color: #f9fafb; padding: 20px 28px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">TodoApp &copy; 2026. All rights reserved.</p>
      </div>
    </div>
  </div>
`;

export const sendWelcomeEmail = async (to, fullName) => {
  await transporter.sendMail({
    from: `"TodoApp" <${process.env.EMAIL}>`,
    to,
    subject: "Welcome to TodoApp!",
    html: emailWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 64px; height: 64px; background-color: #e8f5e9; border-radius: 50%; margin: 0 auto 16px; line-height: 64px; font-size: 28px;">&#10003;</div>
        <h2 style="color: #1f2937; margin: 0 0 8px; font-size: 22px;">Account Created!</h2>
        <p style="color: #6b7280; margin: 0;">Welcome aboard, <strong>${fullName}</strong></p>
      </div>
      <p style="color: #374151; line-height: 1.6; text-align: center;">Your email has been verified and your account is now active. You can now login and start managing your todos.</p>
    `),
  });
};

export const sendOTPEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"TodoApp" <${process.env.EMAIL}>`,
    to,
    subject: "Your OTP Code - TodoApp",
    html: emailWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 64px; height: 64px; background-color: #fff3e0; border-radius: 50%; margin: 0 auto 16px; line-height: 64px; font-size: 28px;">&#128274;</div>
        <h2 style="color: #1f2937; margin: 0 0 8px; font-size: 22px;">Verification Code</h2>
        <p style="color: #6b7280; margin: 0;">Use the code below to complete your request</p>
      </div>
      <div style="background: linear-gradient(135deg, #f3f4f6, #e5e7eb); padding: 20px; border-radius: 10px; text-align: center; margin: 24px 0;">
        <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #1f2937;">${otp}</span>
      </div>
      <p style="color: #ef4444; font-size: 13px; text-align: center;">Expires in 10 minutes. Do not share this code.</p>
    `),
  });
};

export const sendLoginAlert = async (to, fullName) => {
  const now = new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" });

  await transporter.sendMail({
    from: `"TodoApp" <${process.env.EMAIL}>`,
    to,
    subject: "New Login Detected - TodoApp",
    html: emailWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 64px; height: 64px; background-color: #e0f2fe; border-radius: 50%; margin: 0 auto 16px; line-height: 64px; font-size: 28px;">&#128275;</div>
        <h2 style="color: #1f2937; margin: 0 0 8px; font-size: 22px;">New Login</h2>
        <p style="color: #6b7280; margin: 0;">Hi <strong>${fullName}</strong>, a new login was detected on your account.</p>
      </div>
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 10px; margin: 20px 0;">
        <p style="color: #374151; margin: 4px 0; font-size: 14px;"><strong>Time:</strong> ${now}</p>
      </div>
      <p style="color: #ef4444; font-size: 13px; text-align: center;">If this wasn't you, please reset your password immediately.</p>
    `),
  });
};

export const sendPasswordChangedEmail = async (to) => {
  const now = new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" });

  await transporter.sendMail({
    from: `"TodoApp" <${process.env.EMAIL}>`,
    to,
    subject: "Password Changed - TodoApp",
    html: emailWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 64px; height: 64px; background-color: #fce4ec; border-radius: 50%; margin: 0 auto 16px; line-height: 64px; font-size: 28px;">&#128272;</div>
        <h2 style="color: #1f2937; margin: 0 0 8px; font-size: 22px;">Password Changed</h2>
        <p style="color: #6b7280; margin: 0;">Your account password was successfully changed.</p>
      </div>
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 10px; margin: 20px 0;">
        <p style="color: #374151; margin: 4px 0; font-size: 14px;"><strong>Time:</strong> ${now}</p>
      </div>
      <p style="color: #ef4444; font-size: 13px; text-align: center;">If you didn't make this change, please contact support immediately.</p>
    `),
  });
};

export const sendVerificationEmail = async (to, token) => {
  const verifyLink = `${process.env.BASE_URL}/api/auth/verify-email/${token}`;

  await transporter.sendMail({
    from: `"TodoApp" <${process.env.EMAIL}>`,
    to,
    subject: "Verify Your Email - TodoApp",
    html: emailWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 64px; height: 64px; background-color: #e3f2fd; border-radius: 50%; margin: 0 auto 16px; line-height: 64px; font-size: 28px;">&#9993;</div>
        <h2 style="color: #1f2937; margin: 0 0 8px; font-size: 22px;">Verify Your Email</h2>
        <p style="color: #6b7280; margin: 0;">Click the button below to activate your account</p>
      </div>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${verifyLink}"
           style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #4CAF50, #2E7D32); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Verify Email
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">This link expires in 1 hour.</p>
    `),
  });
};
