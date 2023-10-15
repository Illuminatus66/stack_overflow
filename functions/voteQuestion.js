//This file has a lot more comments than usual because there are a lot of nested queries and if-else blocks and inline if-else statements
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

const keyspace = process.env.ASTRA_DB_KEYSPACE;
const questionsTable = process.env.ASTRA_DB_QUESTIONS; //using tablename1 and tablename2 was a stupid idea, this is much better
const votesTable = process.env.ASTRA_DB_VOTES; 

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

exports.handler = auth(async (event, context) => {
  const pathSegments = event.path.split('/');
  const question_id = pathSegments[pathSegments.length - 1];
  const { value } = JSON.parse(event.body);
  const user_id = event.user_id;

  try {
    await client.connect();
    
    const selectQuestionQuery = `
      SELECT * FROM ${keyspace}.${questionsTable}
      WHERE question_id = ?`;

    const selectQuestionParams = [question_id];

    const resultQuestion = await client.execute(selectQuestionQuery, selectQuestionParams, {
      prepare: true,
    });
    // this if block is not so important, but it's a good habit to check the existence of an entry first
    if (resultQuestion.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Question unavailable..." }),
      };
    }

    const question = resultQuestion.rows[0];

    // Check if the user has already voted on this question
    const selectVoteQuery = `
      SELECT * FROM ${keyspace}.${votesTable}
      WHERE user_id = ? AND question_id = ?`;

    const selectVoteParams = [user_id, question_id];

    const resultVote = await client.execute(selectVoteQuery, selectVoteParams, {
      prepare: true,
    });

    // Function enters this block if no vote has been registered earlier
    if (resultVote.rows.length === 0) {
      // The vote_count field in the questions table simply gets incremented/decremented by 1 when a user votes on a question for the first time
      if (value === "upvote") {
        question.vote_count += 1;
      } else if (value === "downvote") {
        question.vote_count -= 1;
      }

      // Create a new entry for the user's vote inside the votes table depending on the value retrieved from the QuestionsDetails page
      const insertVoteQuery = `
        INSERT INTO ${keyspace}.${votesTable} (user_id, question_id, vote_value)
        VALUES (?, ?, ?)`;

      const insertVoteParams = [user_id, question_id, value === "upvote" ? 1 : -1];

      await client.execute(insertVoteQuery, insertVoteParams, {
        prepare: true,
      });
    } else {
      // Function enters this else block if there is already an existing entry for a user's vote on a particular question
      const existingVote = resultVote.rows[0];

      // Function enters if block, if the user has previously upvoted the question and has now pressed he upvote button again
      if (value === "upvote" && existingVote.vote_value === 1) {
        // Since user has already upvoted, remove the vote entry from the votes table altogether
        question.vote_count -= 1;
        await client.execute(`DELETE FROM ${keyspace}.${votesTable} WHERE user_id = ? AND question_id = ?`, [user_id, question_id], { prepare: true });

        //Function enters else if block, if the user has previously downvoted the question and has now pressed the downvote button again
      } else if (value === "downvote" && existingVote.vote_value === -1) {
        // Since user has already downvoted, remove the vote entry from the votes table altogether
        question.vote_count += 1;
        await client.execute(`DELETE FROM ${keyspace}.${votesTable} WHERE user_id = ? AND question_id = ?`, [user_id, question_id], { prepare: true });

        //Function enters the final else block if the values from the current button click and the value present inside the votes table are dissimilar
        //This is the case when the user has previously upvoted the question and has now pressed the downvote button or vice-versa which means we have
        //to account for the nullification of the previous vote and the incrementing/decrementing action, based on the current vote.
      } else {
        if (value === "upvote") {
          question.vote_count += 2;
        } else if (value === "downvote") {
          question.vote_count -= 2;
        }

        await client.execute(`UPDATE ${keyspace}.${votesTable} SET vote_value = ? WHERE user_id = ? AND question_id = ?`, [value === "upvote" ? 1 : -1, user_id, question_id], { prepare: true });
      }
    }

    // Update the vote_count in the questions table
    await client.execute(`UPDATE ${keyspace}.${questionsTable} SET vote_count = ? WHERE question_id = ?`, [question.vote_count, question_id], { prepare: true });

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
  } finally {
    await client.shutdown();
  }
});
