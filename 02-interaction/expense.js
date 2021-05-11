const PROCESS = require('process');
const { Client } = require("pg");


class HELPERS {
  static printHeader() {
    console.log(
  ` id |      date added |     amount | memo
  -------------------------------------------------------------`
    );
  }

  static printRow(colArr) {
    console.log(colArr.join(" | "));
  }

  static logAndExit(error) {
    console.log(error);
    PROCESS.exit(1);
  }
}


class ExpenseData {
  constructor() {
    this.client = new Client({
      database: "js185_expenses",
      password: "pw"
    });
  }

  async list() {
    await this.client.connect()
                .catch(error => logAndExit(error));
  
    let query = "SELECT * FROM expenses;"
    let data = await this.client.query(query)
                           .catch(error => logAndExit(error));
  
    HELPERS.printHeader();
  
    data.rows.forEach(row => {
      let columns = [
        String(row.id).padStart(3),
        row.created_on.toDateString().padStart(15),
        row.amount.padStart(10),
        row.memo
      ];
      HELPERS.printRow(columns);
    });
  
    await this.client.end()
                .catch(error => logAndExit(error));
  }
  
  
  async add(amount, memo) {
    await this.client.connect()
                .catch(error => logAndExit(error));
  
    let queryText = `INSERT INTO expenses (amount, memo) VALUES ($1, $2);`;
    let queryValues = [amount, memo];
    await this.client.query(queryText, queryValues)
                .catch(error => logAndExit(error)).catch(error => logAndExit(error));
  
    await this.client.end()
                .catch(error => logAndExit(error));
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
    } 
    else if (command = "list") {
      this.expenses.list();
    }
  }
}


cli = new CLI();
cli.run();