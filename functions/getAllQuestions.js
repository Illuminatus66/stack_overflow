import { Client } from 'cassandra-driver';
import dotenv from 'dotenv';
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

exports.handler = async function (event, context) {
  const keyspace = process.env.ASTRA_DB_KEYSPACE;
  const questionsTable = process.env.ASTRA_DB_QUESTIONS;
  const answersTable = process.env.ASTRA_DB_ANSWERS;
  try {
    const queryQuestions = `SELECT * FROM ${keyspace}.${questionsTable}`;
    const questions = await client.execute(queryQuestions, [], { prepare: true });

    const queryAnswers = `SELECT * FROM ${keyspace}.${answersTable} WHERE question_id = ?`;

    const questionList = await Promise.all(questions.rows.map(async (question) => {
      const questionId = question.question_id;
      const answers = await client.execute(queryAnswers, [questionId], { prepare: true });
      return {
        ...question,
        answers: answers.rows,
      };
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(questionList),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Something went wrong...' }),
    };
  }
};
