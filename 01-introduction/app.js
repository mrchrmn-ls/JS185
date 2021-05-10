const { Client } = require("pg");

let client = new Client({
  database: "films",
  password: "pw"
});

async function logQuery(queryText) {
  await client.connect();

  let data = await client.query(queryText);
  client.end();

  console.log(data.rows);
}

logQuery("SELECT * FROM directors");