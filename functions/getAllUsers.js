import dotenv from "dotenv";
import { MongoClient } from "mongodb";
dotenv.config();

exports.handler = async function (event, context) {
  const uri = process.env.CONNECTION_URL;
  const databaseName= "test";
  const collectionName= "users";
  let client;
  
  try {
    client = new MongoClient (uri, { useUnifiedTopology: true, useNewUrlParser: true });
    await client.connect();
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);
    const allUsers = await collection.find().toArray();
    const allUserDetails = allUsers.map((user) => ({
        _id: user._id,
        name: user.name,
        about: user.about,
        tags: user.tags,
        joinedOn: user.joinedOn,
    }));
    return {
      statusCode: 200,
      body: JSON.stringify(allUserDetails),
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
