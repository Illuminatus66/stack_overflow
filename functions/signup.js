import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import users from "../models/auth.js";
import mongoose from "mongoose";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

connectDB();

exports.handler = async function (event, context) {
  const { name, email, password } = JSON.parse(event.body);
  
  try {
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User already exists." }),
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await users.create ({
      name,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return {
      statusCode: 201,
      body: JSON.stringify({ result: newUser, token }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Something went wrong..." }),
    };
  }
};
