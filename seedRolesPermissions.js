import mongoose from "mongoose";
import Permission from "./models/Permission.js";
import Role from "./models/Role.js";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";

const permissionsData = [
  { name: "user.read", description: "Read user data" },
  { name: "user.updateRole", description: "Update user role" },
  { name: "user.deactivate", description: "Deactivate user" },

  { name: "category.create", description: "Create category" },
  { name: "category.update", description: "Update category" },
  { name: "category.delete", description: "Delete category" },
  { name: "category.read", description: "Read category" },

  { name: "order.read", description: "Read all orders" },
  { name: "order.updateStatus", description: "Update order status" },
  {
    name: "order.updatePaymentStatus",
    description: "Update order payment status",
  },

  { name: "product.create", description: "Create product" },
  { name: "product.update", description: "Update product" },
  { name: "product.delete", description: "Delete product" },
  { name: "product.addReview", description: "Add product review" },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    // Insert permissions if not exists
    const permissions = [];
    for (const permData of permissionsData) {
      let perm = await Permission.findOne({ name: permData.name });
      if (!perm) {
        perm = await Permission.create(permData);
        console.log(`Permission created: ${perm.name}`);
      } else {
        console.log(`Permission exists: ${perm.name}`);
      }
      permissions.push(perm);
    }

    // Create Admin Role with all permissions
    let adminRole = await Role.findOne({ name: "admin" });
    if (!adminRole) {
      adminRole = await Role.create({
        name: "admin",
        description: "Administrator role with full permissions",
        permissions: permissions.map((p) => p._id),
      });
      console.log("Admin role created with all permissions");
    } else {
      console.log("Admin role already exists");
    }

    // Optional: Create other roles like 'user' or 'manager' with limited permissions here

    mongoose.disconnect();
    console.log("Seeding complete");
  } catch (err) {
    console.error("Seeding failed:", err);
    mongoose.disconnect();
  }
}

seed();
