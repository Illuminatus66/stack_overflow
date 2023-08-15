import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
import users from "../models/auth.js";

dotenv.config();

// Establish database connection
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

// Invoke the database connection
connectDB();

const auth = (handler) => async (event, context) => {
  try {
    const authorizationHeader = event.headers && event.headers.authorization;
    if (!authorizationHeader) {
      return {
        statusCode: 401,
        body: JSON.stringify("Unauthorized: Missing authorization header"),
      };
    }

    const token = authorizationHeader.split(" ")[1];
    let decodeData = jwt.verify(token, process.env.JWT_SECRET);
    event.userId = decodeData?.id;
    return await handler(event, context);
  } catch (error) {
    console.log(error);
    return {
      statusCode: 401,
      body: JSON.stringify("Unauthorized"),
    };
  }
};

exports.handler = auth (async (event, context) => {
  const pathSegments = event.path.split('/');
  const _id = pathSegments[pathSegments.length - 1];
  const { name, about, tags } = JSON.parse(event.body);

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return {
      statusCode: 404,
      body: "user unavailable...",
    };
  }

  try {
    const updatedProfile = await users.findByIdAndUpdate(
      _id,
      { $set: { name: name, about: about, tags: tags } },
      { new: true }
    );
    return {
      statusCode: 200,
      body: JSON.stringify(updatedProfile),
    };
  } catch (error) {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: error.message }),
    };
  }
});
