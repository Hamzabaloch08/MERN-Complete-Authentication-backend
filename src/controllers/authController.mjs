import { compare, hash } from "bcrypt";
import { getDB, COLLECTIONS } from "../config/db.mjs";
import {
  isValidEmail,
  isValidPassword,
  isValidName,
} from "../utils/validators.mjs";
import jwt from "jsonwebtoken";
import {
  sendLoginAlert,
  sendOTPEmail,
  sendPasswordChangedEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../utils/sendMail.mjs";

const makeToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const signup = async (req, res) => {
  try {
    const { fullName, email, password, redirectUrl } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidName(fullName)) {
      return res
        .status(400)
        .json({ message: "Full name must be at least 3 characters" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!isValidPassword(password)) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const users = getDB().collection(COLLECTIONS.USERS);
    const alreadyExists = await users.findOne({ email });
    if (alreadyExists) {
      return res
        .status(400)
        .json({ message: "This email is already registered" });
    }

    const hashPassword = await hash(password, 10);

    const verifyToken = jwt.sign(
      { fullName, email, password: hashPassword, redirectUrl },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    await sendVerificationEmail(email, verifyToken);

    res.status(200).json({
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const users = getDB().collection(COLLECTIONS.USERS);
    const alreadyExists = await users.findOne({ email: decoded.email });
    if (alreadyExists) {
      return res.send("Email already verified. You can login now.");
    }

    await users.insertOne({
      fullName: decoded.fullName,
      email: decoded.email,
      password: decoded.password,
      createdAt: new Date(),
    });

    sendWelcomeEmail(decoded.email, decoded.fullName);

    res.send(`
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 60px auto; text-align: center; padding: 20px;">
        <div style="width: 64px; height: 64px; background-color: #e8f5e9; border-radius: 50%; margin: 0 auto 16px; line-height: 64px; font-size: 28px;">&#10003;</div>
        <h2 style="color: #1f2937;">Email Verified Successfully!</h2>
        <p style="color: #6b7280;">You can now login to your account.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #ef4444; font-size: 13px; font-weight: 600;">Note: Currently using Expo Go for development. In production (APK/CLI build), deep linking will automatically open the app. For now, please go back to the app manually.</p>
      </div>
    `);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(400)
        .send("Verification link expired. Please signup again.");
    }
    console.error("Verify error:", error);
    res.status(400).send("Invalid verification link.");
  }
};

export const checkVerified = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ verified: false });

    const users = getDB().collection(COLLECTIONS.USERS);
    const user = await users.findOne({ email });

    res.json({ verified: !!user });
  } catch (error) {
    res.status(500).json({ verified: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = getDB().collection(COLLECTIONS.USERS);

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!isValidPassword(password)) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await users.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Wrong email or password" });
    }

    const matchPassword = await compare(password, user.password);
    if (!matchPassword) {
      return res.status(401).json({ message: "Wrong email or password" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const verifyToken = jwt.sign(
      { userId: user._id.toString(), fullName: user.fullName, email: user.email, otp },
      process.env.JWT_SECRET,
      { expiresIn: "5m" },
    );

    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: "Otp email sent. Please check your inbox.",
      tempToken: verifyToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { otp, tempToken } = req.body;

    if (!otp || !tempToken) {
      return res.status(400).json({ message: "OTP and token are required" });
    }

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    console.log(decoded.otp,"real otp")
    console.log(otp,"enter otp")

    if (otp !== decoded.otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    const token = makeToken(decoded.userId);

    sendLoginAlert(decoded.email, decoded.fullName);

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: decoded.userId, fullName: decoded.fullName, email: decoded.email },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "OTP expired. Please login again." });
    }
    console.error("Verify OTP error:", error);
    res.status(400).json({ message: "Invalid token" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const users = getDB().collection(COLLECTIONS.USERS);
    const user = await users.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const resetToken = jwt.sign(
      { userId: user._id.toString(), email: user.email, otp },
      process.env.JWT_SECRET,
      { expiresIn: "5m" },
    );

    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: "OTP sent to your email",
      tempToken: resetToken,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const { otp, tempToken } = req.body;

    if (!otp || !tempToken) {
      return res.status(400).json({ message: "OTP and token are required" });
    }

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);

    if (otp !== decoded.otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    const resetToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );

    res.status(200).json({
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "OTP expired. Please try again." });
    }
    console.error("Verify reset OTP error:", error);
    res.status(400).json({ message: "Invalid token" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    const hashedPassword = await hash(newPassword, 10);
    const users = getDB().collection(COLLECTIONS.USERS);

    await users.updateOne(
      { email: decoded.email },
      { $set: { password: hashedPassword } },
    );

    sendPasswordChangedEmail(decoded.email);

    res.status(200).json({ message: "Password reset successful. You can now login." });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Session expired. Please try again." });
    }
    console.error("Reset password error:", error);
    res.status(400).json({ message: "Invalid token" });
  }
};
