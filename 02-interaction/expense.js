const PROCESS = require("process");
const rlsync = require("readline-sync");

const { Client } = require("pg");

function logAndExit(error) {
  console.log(error);
  PROCESS.exit(1);
}

class ExpenseData {
  constructor() {
    this.client = new Client({
      database: "js185_expenses",
      password: "pw"
    });
  }

  async list() {
    await this.client.connect().catch(error => logAndExit(error));
  
    let query = "SELECT * FROM expenses;"
    let data = await this.client.query(query).catch(error => logAndExit(error));

    this.printResults(data);
  
    await this.client.end().catch(error => logAndExit(error));
  }

  async add(amount, memo) {
    await this.client.connect().catch(error => logAndExit(error));
  
    let queryText = "INSERT INTO expenses (amount, memo) VALUES ($1, $2);";
    let queryValues = [amount, memo];
    await this.client.query(queryText, queryValues).catch(error => logAndExit(error));
  
    await this.client.end().catch(error => logAndExit(error));
  }

  async search(term) {
    await this.client.connect().catch(error => logAndExit(error));

    let queryText = "SELECT * FROM expenses WHERE memo ILIKE $1;";
    let queryValues = [`%${term}%`];
    let data = await this.client.query(queryText, queryValues).catch(error => logAndExit(error));

    this.printResults(data);

    await this.client.end().catch(error => logAndExit(error));
  }

  async delete(id) {
    await this.client.connect().catch(error => logAndExit(error));

    let queryText = "SELECT * FROM expenses WHERE id = $1;";
    let queryValues = [id];
    let data = await this.client.query(queryText, queryValues).catch(error => logAndExit(error));

    if (data.rowCount === 0) {
      console.log(`There is no expense with the id '${id}'`);
    } else {
      let queryText = "DELETE FROM expenses WHERE id = $1;";
      await this.client.query(queryText, queryValues).catch(error => logAndExit(error));
      console.log("The following entry has been deleted:");
      this.printResults(data);
    }

    await this.client.end().catch(error => logAndExit(error));
  }

  async clear() {
    await this.client.connect().catch(error => logAndExit(error));
  
    let query = "DELETE FROM expenses;"
    let data = await this.client.query(query).catch(error => logAndExit(error));

    console.log("All expenses have been deleted.");
  
    await this.client.end().catch(error => logAndExit(error));      
  }

  printResults(data) {
    function printHeader() {
      console.log(
` id |      date added |     amount | memo
-------------------------------------------------------------`);
    }

    function printRow(colArr) {
      console.log(colArr.join(" | "));
    }
  
//    printHeader();
    data.rows.forEach(row => {
      let columns = [
        String(row.id).padStart(3),
        row.created_on.toDateString().padStart(15),
        row.amount.padStart(10),
        row.memo
      ];
      printRow(columns);
    });
  }
}


class CLI {
  constructor() {
    this.expenses = new ExpenseData();
    this.args = PROCESS.argv;
  }

  static COMMANDS = ["add", "clear", "list", "delete", "search"];

  static HELP = `
An expense recording system

Commands:

add AMOUNT MEMO [DATE] - record a new expense
clear - delete all expenses
list - list all expenses
delete NUMBER - remove expense with id NUMBER
search QUERY - list expenses with a matching memo field
`;

  static printHelp() {
    console.log(CLI.HELP);
  }

  run() {
    let command = this.args[2];

    if (CLI.COMMANDS.includes(command)) {
      this.evaluate(command);
    } else {
      CLI.printHelp();
    }
  }
  
  evaluate(command) {
    if (command === "add") {
      let amount = this.args[3];
      let memo = this.args[4];

      if (amount && memo) {
        this.expenses.add(amount, memo);
      }
      else {
        console.log("You must provide an amount and a memo.");
      }

    } else if (command === "list") {
      this.expenses.list();

    } else if (command === "search") {
      let term = this.args[3];

      if (term) {
        this.expenses.search(term);
      }
      else {
        console.log("You must provide a search term.");
      }

    } else if (command === "delete") {
      let id = this.args[3];

      if (id) {
        this.expenses.delete(id);
      }
      else {
        console.log("You must provide an id.");
      } 

    } else if (command === "clear") {
      if (rlsync.question("This will remove all expenses. Are you sure? (enter y to confirm) - ") === "y") {
        this.expenses.clear();
      } else {
        PROCESS.exit(1);
      }
    }
  }
}


cli = new CLI();
cli.run();