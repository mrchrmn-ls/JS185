const { Client } = require("pg");

module.exports = class PgPersistence {

  async testQuery1() {
    const SQL = "SELECT * FROM todolists";

    let client = new Client({
      database: "js185_todo_list",
      password: "pw"
    });

    await client.connect();
    let result = await client.query(SQL);
    console.log("query1:", result.rows);
    await client.end();
  }


  async testQuery2() {
    const SQL = "SELECT * FROM todos";

    let client = new Client({
      database: "js185_todo_list",
      password: "pw"
    });

    await client.connect();
    let result = await client.query(SQL);
    console.log("query2:", result.rows);
    await client.end();
  }


  constructor(session) {
    // this._todoLists = session.todoLists || deepCopy(SeedData);
    // session.todoLists = this._todoLists;
  }

  listDone(list) {
    // return list.todos.length > 0 && list.todos.every(item => item.done);
  }

  somethingLeftToDo(list) {
    // return list.todos.some(item => !item.done);
  }

  getSortedLists() {
    // let lists = deepCopy(this._todoLists);
    // let notDoneLists = lists.filter(list => !this.listDone(list));
    // let doneLists = lists.filter(list => this.listDone(list));
    // return [].concat(sortByTitle(notDoneLists), sortByTitle(doneLists));
  }

  getListFromId(id) {
    // let list = this._findList(id);
    // return deepCopy(list);
  }

  getTodoFromList(todoId, list) {
    // return list.todos.find(item => item.id === todoId);
  }

  toggleTodo(listId, todoId) {
    // let todo = this._findTodo(listId, todoId);
    // todo.done = !todo.done;
  }

  deleteTodo(listId, todoId) {
    // let list = this._findList(listId);
    // let index = list.todos.findIndex(item => item.id === todoId);
    // list.todos.splice(index, 1);
  }

  markListDone(listId) {
    // let list = this._findList(listId);
    // list.todos.forEach(item => {
    //   item.done = true;
    // });
  }

  addTodo(listId, title) {
    // let list = this._findList(listId);
    // list.todos.push({
    //   id: nextId(),
    //   title: title,
    //   done: false
    // });
  }

  newList(title) {
    // this._todoLists.push({
    //   id: nextId(),
    //   title: title,
    //   todos: []
    // });
  }

  deleteList(listId) {
    // let index = this._todoLists.findIndex(list => list.id === listId);
    // this._todoLists.splice(index,1);
  }

  setListTitle(listId, title) {
    // this._findList(listId).title = title;
  }

  validTitle(title) {
    // return !this._todoLists.some(list => list.title === title);
  }

  _findList(listId) {
    // return this._todoLists.find(list => list.id === listId);
  }

  _findTodo(listId, todoId) {
  //   let list = this._findList(listId);
  //   return list.todos.find(item => item.id === todoId);
  }
};