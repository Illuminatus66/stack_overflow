import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
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
const tablename = process.env.ASTRA_DB_USERS;

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
  const { email, password } = JSON.parse(event.body);

  try {
    const query = `
      SELECT * FROM ${keyspace}.${tablename}
      WHERE email = ?`;

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
      { email: existingUser.email, id: existingUser.userid },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

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
