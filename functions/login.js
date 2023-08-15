import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

exports.handler = async function (event, context) {

const { email, password } = JSON.parse(event.body);
const uri = process.env.CONNECTION_URL;
const databaseName= "test";
const collectionName= "users";
let client;
  try {
    client = new MongoClient (uri, { useUnifiedTopology: true, useNewUrlParser: true });
    await client.connect();
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);
    const existingUser = await collection.findOne({ email });
    if (!existingUser) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User doesn't exist." }),
      };
    }
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
      { email: existingUser.email, id: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
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
