import nodemailer from "nodemailer";

let transporter;

const createTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

export const sendOTPEmail = async (email, otp) => {
  try {
    const mailTransporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Your OTP Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #333;">OTP Verification</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="letter-spacing: 5px; color: #2c3e50;">${otp}</h1>
          <p>This OTP is valid for <strong>5 minutes</strong>.</p>
          <p>If you did not request this, please ignore this email.</p>
          <br/>
          <p style="font-size: 12px; color: gray;">
            Do not share this OTP with anyone.
          </p>
        </div>
      `,
    };

    await mailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send OTP email");
  }
};
