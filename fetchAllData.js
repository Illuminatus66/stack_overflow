const fs = require("fs");
const dotenv = require("dotenv");
const { Client } = require("cassandra-driver");

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

const fetchAllDataFromTables = async () => {
  try {
    console.log("Connecting to AstraDB...");
    await client.connect();
    console.log("Connected to AstraDB.");

    const queryTables = `
      SELECT table_name
      FROM system_schema.tables
      WHERE keyspace_name = ?;
    `;

    const params = [keyspace];

    const resultTables = await client.execute(queryTables, params);

    // Create a file stream to write data to a text file
    const outputStream = fs.createWriteStream("database_entries.txt");

    for (const row of resultTables.rows) {
      const tableName = row.table_name;
      console.log(`Fetching data from ${keyspace}.${tableName}...`);

      const queryData = `
        SELECT * FROM ${keyspace}.${tableName};
      `;

      const resultData = await client.execute(queryData);
      const dataText = JSON.stringify(resultData.rows);

      // Write data to the text file
      outputStream.write(`Data from ${keyspace}.${tableName}:\n${dataText}\n`);
    }

    outputStream.end();

    console.log("All data fetched successfully and saved to 'database_entries.txt'.");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await client.shutdown();
    console.log("AstraDB connection closed.");
  }
};

const main = async () => {
  await fetchAllDataFromTables();
};

main();
