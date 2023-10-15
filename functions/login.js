import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
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
const usersTable = process.env.ASTRA_DB_USERS;

exports.handler = async function (event, context) {
  const { email, password } = JSON.parse(event.body);

  try {
    await client.connect();
    
    const query = `
      SELECT * FROM ${keyspace}.${usersTable}
      WHERE email = ?
      ALLOW FILTERING`;

    const params = [email];

    const result = await client.execute(query, params, { prepare: true });

    if (result.rowLength === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User doesn't exist." }),
      };
    }

    const existingUser = result.first();

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid credentials" }),
      };
    }

    const token = jwt.sign(
      { email: existingUser.email, user_id: existingUser.user_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log(`User ${existingUser.name} with user_id ${existingUser.user_id} has just logged in`);

    return {
      statusCode: 200,
      body: JSON.stringify({ result: existingUser, token }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Something went wrong..." }),
    };
  }
};
