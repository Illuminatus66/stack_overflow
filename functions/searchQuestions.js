import dotenv from "dotenv";
import { MongoClient } from 'mongodb';
dotenv.config();

exports.handler = async function (event, context) {
  const { query } = event.queryStringParameters;
  const uri = process.env.CONNECTION_URL;
  const databaseName = "test";
  const collectionName = "questions";
  let client;

  try {
    client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    const searchQuery = {
      search: {
        query: query,
        path: ["questionBody", "questionTags", "questionTitle"],
      },
    };

    const searchResults = await collection
      .aggregate([{ $search: searchQuery }, { $limit: 20 }])
      .toArray();

    return {
      statusCode: 200,
      body: JSON.stringify(searchResults),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Search failed" }),
    };
  } finally {
    client.close();
  }
};
