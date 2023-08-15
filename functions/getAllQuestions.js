import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

exports.handler= async function (event, context) {
  const uri = process.env.CONNECTION_URL;
  const databaseName = "test";
  const collectionName = "questions";
  let client;
  
  try {
    client = new MongoClient(uri, { useUnifiedTopology: true, useNewUrlParser: true });
    await client.connect();
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);
    const questionList = await collection.find().sort({ askedOn: -1 }).toArray();
    return {
      statusCode: 200,
      body: JSON.stringify(questionList),
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
