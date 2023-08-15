import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Questions from "../models/Questions.js";

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
  const { id: _id } = event.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return {
      statusCode: 404,
      body: "question unavailable...",
    };
  }

  try {
    await Questions.findByIdAndRemove(_id);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "successfully deleted..." }),
    };
  } catch (error) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: error.message }),
    };
  }
});
