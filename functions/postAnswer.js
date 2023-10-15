import jwt from "jsonwebtoken";
import { Client } from "cassandra-driver";
import dotenv from "dotenv";
import path from 'path';

dotenv.config();

const filePath = path.join(__dirname, '../secure-connect-stack-overflow.zip')

const client = new Client({
  cloud: {
    secureConnectBundle: filePath,
  },
  credentials: {
    username: process.env.ASTRA_DB_USERNAME,
    password: process.env.ASTRA_DB_PASSWORD,
  },
});

client.connect().catch(error => {
  console.error('Failed to connect to the database:', error);
  process.exit(1);
});

const keyspace = process.env.ASTRA_DB_KEYSPACE;
const questionsTable = process.env.ASTRA_DB_QUESTIONS;
const answersTable = process.env.ASTRA_DB_ANSWERS;

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
    event.user_id = decodeData?.user_id;
    return await handler(event, context);
  } catch (error) {
    console.log(error);
    return {
      statusCode: 401,
      body: JSON.stringify("Unauthorized"),
    };
  }
};

const updateNoOfQuestions = async (question_id, noofanswers) => {
  try {
    const query = `
      UPDATE ${keyspace}.${questionsTable}
      SET noofanswers = ?
      WHERE question_id = ?`;

    const params = [noofanswers, question_id];

    await client.execute(query, params, { prepare: true });
  } catch (error) {
    console.log(error);
  }
};

exports.handler = auth(async (event, context) => {
  const { question_id, noofanswers, answerbody, useranswered } = JSON.parse(event.body);
  const user_id = event.user_id;

  try {
    await updateNoOfQuestions(question_id, noofanswers);

    console.log(`Number of answers associated to question ${question_id} has been updated to ${noofanswers} `)

    const insertQuery = `
      INSERT INTO ${keyspace}.${answersTable} (answer_id, question_id, answerbody, useranswered, user_id, answeredon)
      VALUES (uuid(), ?, ?, ?, ?, toTimestamp(now()))`;

    const insertParams = [question_id, answerbody, useranswered, user_id];

    await client.execute(insertQuery, insertParams, { prepare: true });

    console.log(`A new answer associated to question ${question_id} has been posted by ${useranswered} having user_id ${user_id}`)

    return {
      statusCode: 200,
      body: JSON.stringify({message: "Answer posted successfully!"}),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Something went wrong..." }),
    };
  }
});
