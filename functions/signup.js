import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

exports.handler = async function (event, context) {
  const uri = process.env.CONNECTION_URL;
  const databaseName= "test";
  const collectionName= "users";
  const { name, email, password } = JSON.parse(event.body);
  let client;
  
  try {
    client = new MongoClient (uri, { useUnifiedTopology: true, useNewUrlParser: true });
    await client.connect();
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User already exists." }),
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = {
      name,
      email,
      password: hashedPassword,
    };
    const result = await collection.insertOne(newUser);
    const token = jwt.sign(
      { email: newUser.email, id: result.insertedId },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    return {
      statusCode: 201,
      body: JSON.stringify({ result: newUser, token }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Something went wrong..." }),
    };
  } finally {
    if (client) {
      client.close();
    }
  }
};
