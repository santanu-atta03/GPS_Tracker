// utils/sendEmail.js
import nodemailer from "nodemailer";

export const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App password
    },
  });

  await transporter.sendMail({
    from: `"Bus App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Verification Code",
    html: `<h2>Your OTP is: <b>${otp}</b></h2><p>Valid for 5 minutes</p>`,
  });
};
