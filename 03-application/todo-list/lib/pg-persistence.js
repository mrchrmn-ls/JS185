const { dbQuery } = require("./db-query");

module.exports = class PgPersistence {
  constructor(session) {
    // this._todoLists = session.todoLists || deepCopy(SeedData);
    // session.todoLists = this._todoLists;
  }

  listDone(list) {
    return list.todos.length > 0 && list.todos.every(item => item.done);
  }

  somethingLeftToDo(list) {
    return list.todos.some(item => !item.done);
  }

  _reorderTodoLists(lists) {
    let notDone = [];
    let done = [];

    lists.forEach(list => {
      if (this.listDone(list)) done.push(list);
      else notDone.push(list);
    });

    return notDone.concat(done);
  }

  async getSortedLists() {
    const ALL_TODOLISTS = "SELECT * FROM todolists ORDER BY lower(title) ASC";
    const FIND_TODOS = "SELECT * FROM todos WHERE todolist_id = $1";

    let result = await dbQuery(ALL_TODOLISTS);
    let todoLists = result.rows;

    for (let index = 0; index < todoLists.length; index += 1) {
      let todoList = todoLists[index];
      let todos = await dbQuery(FIND_TODOS, todoList.id);
      todoList.todos = todos.rows;
    }

    return this._reorderTodoLists(todoLists);
  }

  async getListFromId(id) {
    const FIND_LIST = "SELECT * FROM todolists WHERE id = $1";
    const FIND_TODOS = "SELECT * FROM todos WHERE todolist_id = $1 ORDER BY done, title";

    let list = dbQuery(FIND_LIST, id);
    let todos = dbQuery(FIND_TODOS, id);
    let queryResults = await Promise.all([list, todos]);

    let todoList = queryResults[0].rows[0];
    todoList.todos = queryResults[1].rows;

    return todoList;
  }

  getTodoFromList(todoId, list) {
    return list.todos.find(item => item.id === todoId);
  }

  async toggleTodo(listId, todoId) {
    const TOGGLE = "UPDATE todos SET done = NOT done WHERE id = $1 AND todolist_id = $2";
    await dbQuery(TOGGLE, todoId, listId);
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