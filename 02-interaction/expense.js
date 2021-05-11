const PROCESS = require('process');
const { Client } = require("pg");

let client = new Client({
  database: "js185_expenses",
  password: "pw"
});

const HELP = `
An expense recording system

Commands:

add AMOUNT MEMO [DATE] - record a new expense
clear - delete all expenses
list - list all expenses
delete NUMBER - remove expense with id NUMBER
search QUERY - list expenses with a matching memo field
`;

function printHeader() {
  console.log(
` id |      date added |     amount | memo
-------------------------------------------------------------`
  );
}

function printRow(colArr) {
  console.log(colArr.join(" | "));
}

function printHelp() {
  console.log(HELP);
}

function sanitize(string) {
  string = string.split("'").join("''");
  return string;
}

function logAndExit(error) {
  console.log(error);
  PROCESS.exit(1);
}

async function list() {
  await client.connect()
              .catch(error => logAndExit(error));

  let query = "SELECT * FROM expenses;"
  let data = await client.query(query)
                         .catch(error => logAndExit(error));

  printHeader();

  data.rows.forEach(row => {
    let columns = [
      String(row.id).padStart(3),
      row.created_on.toDateString().padStart(15),
      row.amount.padStart(10),
      row.memo
    ]
    printRow(columns);
  });

  await client.end()
              .catch(error => logAndExit(error));
}


async function add(amount, memo) {
  memo = sanitize(memo);

  await client.connect()
              .catch(error => logAndExit(error));

  let query = `INSERT INTO expenses (amount, memo) VALUES (${amount}, '${memo}');`;
  await client.query(query)
              .catch(error => logAndExit(error)).catch(error => logAndExit(error));

  await client.end()
              .catch(error => logAndExit(error));
}


let cliArgs = PROCESS.argv;
let command = cliArgs[2];

if (command === "list") {
  list();

} else if (command === "add") {
  let amount = cliArgs[3];
  let memo = cliArgs[4];
  if (amount && memo) {
    add(amount, memo);
  } else {
    console.log("You must provide and amount and a memo.");
  }

} else {
  printHelp();
}