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

exports.handler = async function (event, context) {
  const { name, email, password } = JSON.parse(event.body);

  try {
    const query = `
      SELECT * FROM ${keyspace}.${usersTable}
      WHERE email = ?
      ALLOW FILTERING`;

    const params = [email];

    const result = await client.execute(query, params, { prepare: true });

    if (result.rowLength > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "User already exists." }),
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const insertUserQuery = `
      INSERT INTO ${keyspace}.${usersTable} ( user_id, name, email, password, joinedon)
      VALUES (uuid(), ?, ?, ?, toTimestamp(now()))`;

    const insertUserParams = [name, email, hashedPassword];

    await client.execute(insertUserQuery, insertUserParams, { prepare: true });

    const getUserIdQuery = `
    SELECT user_id FROM ${keyspace}.${usersTable}
    WHERE email = ?
    ALLOW FILTERING`;

    const getUserIdResult = await client.execute(getUserIdQuery, [email], { prepare: true });
    const user_id = getUserIdResult.first().user_id;

    const token = jwt.sign(
      { email: email, user_id: user_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log(`Congratulations! A new user with user_id: ${user_id} has signed up!`)

    return {
      statusCode: 201,
      body: JSON.stringify({ result: { name, email, user_id }, token }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Something went wrong..." }),
    };
  }
};
