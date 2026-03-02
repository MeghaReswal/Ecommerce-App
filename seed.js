import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Role from "./models/Role.js";

const createAdmin = async () => {
  await mongoose.connect("mongodb://localhost:27017/ecommerce");

  const adminRole = await Role.findOne({ name: "admin" });

  if (!adminRole) {
    console.log("Admin role not found");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  const adminExists = await User.findOne({ email: "admin@example.com" });
  if (adminExists) {
    console.log("Admin already exists");
    process.exit(0);
  }

  await User.create({
    firstName: "Super",
    lastName: "Admin",
    email: "megha@interactivebees.com",
    password: hashedPassword,
    roles: [adminRole._id],
    isActive: true,
    emailVerified: true,
  });

  console.log("Admin created successfully");
  process.exit(0);
};

createAdmin();
