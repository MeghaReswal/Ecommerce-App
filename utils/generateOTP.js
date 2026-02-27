export const generateOTP = (length = 6) => {
  if (length <= 0) {
    throw new Error("OTP length must be greater than 0");
  }

  const digits = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }

  return otp;
};
