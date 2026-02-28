import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { connectDB } from "./src/config/db.mjs";
import authRoutes from "./src/routes/authRoute.mjs";
import nodemailer from "nodemailer";

config();

export const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

transporter.verify((err, success) => {
  if (err) console.log("Email connection error:", err);
  else console.log("Email server ready");
});

const app = express();

//middlewares
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  connectDB();
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
