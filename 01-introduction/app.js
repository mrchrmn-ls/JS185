const { Client } = require("pg");

let client = new Client({
  database: "films",
  password: "pw"
});

async function logQuery(queryText) {
  await client.connect();

  let data = await client.query(queryText);
  client.end();

  console.log(data.rows[1].duration);
}

let currentQuery = "SELECT duration FROM films JOIN directors ON films.director_id = directors.id WHERE name = 'Francis Ford Coppola' ORDER BY duration DESC;"
logQuery(currentQuery);