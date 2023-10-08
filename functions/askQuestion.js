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

const connectDB = async () => {
  try {
    await client.connect();
    console.log("Connected to Cassandra");
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
  try {
    const postQuestionData = JSON.parse(event.body);
    const userId = event.userId;

    const query = `
      INSERT INTO ${keyspace}.${tablename} (question_title, question_body, question_tags, user_posted, user_id, no_of_answers, up_vote, down_vote, asked_on)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, toTimestamp(now()))`;

    const upVote = [];
    const downVote = [];

    const params = [
      postQuestionData.questionTitle,
      postQuestionData.questionBody,
      postQuestionData.questionTags,
      postQuestionData.userPosted,
      userId,
      postQuestionData.noOfAnswers || 0,
      upVote,
      downVote,
    ];

    await client.execute(query, params, { prepare: true });

    return {
      statusCode: 200,
      body: JSON.stringify("Posted a question successfully"),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 409,
      body: JSON.stringify("Couldn't post a new question"),
    };
  }
});
