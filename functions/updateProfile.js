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
  const user_id = pathSegments[pathSegments.length - 1];
  const { name, about, tags } = JSON.parse(event.body);

  try {
    const profileUpdateQuery = `
      UPDATE ${keyspace}.${usersTable}
      SET name = ?, about = ?, tags = ?
      WHERE user_id = ?`;

    const profileUpdateParams = [name, about, tags, user_id];

    const fetchUpdatedUserQuery = `
      SELECT * FROM ${keyspace}.${usersTable}
      WHERE user_id = ?`

    const fetchUpdatedUserParams = [user_id];

    await client.execute(profileUpdateQuery, profileUpdateParams, { prepare: true });
    const updatedUser = await client.execute(fetchUpdatedUserQuery, fetchUpdatedUserParams, { prepare: true });



    return {
      statusCode: 200,
      body: JSON.stringify(updatedUser),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Profile update failed" }),
    };
  }
});
