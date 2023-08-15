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


const updateNoOfQuestions = async (_id, noOfAnswers) => {
  try {
    await Questions.findByIdAndUpdate(_id, {
      $set: { noOfAnswers: noOfAnswers },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.handler = auth (async (event, context) => {
  try {
    const pathSegments = event.path.split('/');
    const _id = pathSegments[pathSegments.length - 1];
    const { answerId, noOfAnswers } = JSON.parse(event.body);

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return {
        statusCode: 404,
        body: "Question unavailable...",
      };
    }
    if (!mongoose.Types.ObjectId.isValid(answerId)) {
      return {
        statusCode: 404,
        body: "Answer unavailable...",
      };
    }

    await updateNoOfQuestions(_id, noOfAnswers);

    await Questions.updateOne(
      { _id },
      { $pull: { answer: { _id: answerId } } }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Successfully deleted..." }),
    };
  } catch (error) {
    return {
      statusCode: 405,
      body: JSON.stringify(error),
    };
  }
});