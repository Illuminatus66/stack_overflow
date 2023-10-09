import jwt from "jsonwebtoken";
import { Client } from "cassandra-driver";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  cloud: {
    secureConnectBundle: "secure-connect-stack-overflow.zip",
  },
  credentials: {
    username: process.env.ASTRA_DB_USERNAME,
    password: process.env.ASTRA_DB_PASSWORD,
  },
});

const keyspace = process.env.ASTRA_DB_KEYSPACE;
const tablename = process.env.ASTRA_DB_QUESTIONS;

// Establish database connection
const connectDB = async () => {
  try {
    await client.connect();
    console.log("Connected to Astra DB");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

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

exports.handler = auth(async (event, context) => {
  const pathSegments = event.path.split('/');
  const question_id = pathSegments[pathSegments.length - 1];
  const { value } = JSON.parse(event.body);
  const userId = event.userId;

  try {
    const selectQuery = `
      SELECT * FROM ${keyspace}.${tablename}
      WHERE question_id = ?`;

    const selectParams = [question_id];

    const result = await client.execute(selectQuery, selectParams, {
      prepare: true,
    });

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: "Question unavailable...",
      };
    }

    const question = result.rows[0];

    const upIndex = question.upvote.findIndex((id) => id === userId);
    const downIndex = question.downvote.findIndex((id) => id === userId);

    if (value === "upVote") {
      if (downIndex !== -1) {
        question.downvote.splice(downIndex, 1);
      }
      if (upIndex === -1) {
        question.upvote.push(userId);
      } else {
        question.upvote.splice(upIndex, 1);
      }
    } else if (value === "downVote") {
      if (upIndex !== -1) {
        question.upvote.splice(upIndex, 1);
      }
      if (downIndex === -1) {
        question.downvote.push(userId);
      } else {
        question.downvote.splice(downIndex, 1);
      }
    }

    const updateQuery = `
      UPDATE ${keyspace}.${tablename}
      SET upVote = ?, downVote = ?
      WHERE question_id = ?`;

    const updateParams = [question.upvote, question.downvote, question_id];

    await client.execute(updateQuery, updateParams, { prepare: true });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Vote updated successfully..." }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Vote update failed" }),
    };
  }
});
