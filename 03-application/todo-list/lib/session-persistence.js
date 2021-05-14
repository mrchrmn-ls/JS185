const SeedData = require("./seed-data");
const deepCopy = require("./deep-copy");
const { sortByTitle } = require("./sort");

module.exports = class SessionPersistence {
  constructor(session) {
    this._todoLists = session.todoLists || deepCopy(SeedData);
    session.todoLists = this._todoLists;
  }

  listDone(list) {
    return list.todos.length > 0 && list.todos.every(todo => todo.done);
  }

  somethingLeftToDo(list) {
    return list.todos.some(todo => !todo.done);
  }

  getSortedLists() {
    let lists = deepCopy(this._todoLists);
    let notDoneLists = lists.filter(list => !this.listDone(list));
    let doneLists = lists.filter(list => this.listDone(list));
    return [].concat(sortByTitle(notDoneLists), sortByTitle(doneLists));
  }

  getListFromId(id) {
    let list = this._todoLists.find(list => list.id === id);
    return deepCopy(list);
  }
};