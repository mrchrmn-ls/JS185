const SeedData = require("./seed-data");
const deepCopy = require("./deep-copy");
const { sortByTitle } = require("./sort");

module.exports = class SessionPersistence {
  constructor(session) {
    this._todoLists = session.todoLists || deepCopy(SeedData);
    session.todoLists = this._todoLists;
  }

  listDone(todoList) {
    return todoList.todos.length > 0 && todoList.todos.every(todo => todo.done);
  }

  getSortedLists() {
    let notDoneLists = this._todoLists.filter(list => !this.listDone(list));
    let doneLists = this._todoLists.filter(list => this.listDone(list));
    return [].concat(sortByTitle(notDoneLists), sortByTitle(doneLists));
  }
};