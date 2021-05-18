const { dbQuery } = require("./db-query");

module.exports = class PgPersistence {
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
    const TOGGLE = "UPDATE todos SET done = NOT done WHERE todolist_id = $1 AND id = $2";
    await dbQuery(TOGGLE, listId, todoId);
  }

  async deleteTodo(listId, todoId) {
    const DELETE_TODO = "DELETE FROM todos WHERE todolist_id = $1 AND id = $2";
    await dbQuery(DELETE_TODO, listId, todoId);
  }

  async markListDone(listId) {
    const MARK_DONE = "UPDATE todos SET done = true WHERE todolist_id = $1 AND done = false";
    await dbQuery(MARK_DONE, listId);
  }

  async addTodo(listId, title) {
    const ADD_TODO = "INSERT INTO todos (todolist_id, title) VALUES ($1, $2)";
    await dbQuery(ADD_TODO, listId, title);
  }

  async newList(title) {
    const NEW_LIST = "INSERT INTO todolists (title) VALUES ($1)";
    await dbQuery(NEW_LIST, title);
  }

  async deleteList(listId) {
    const DELETE_LIST = "DELETE FROM todolists WHERE id = $1";
    await dbQuery(DELETE_LIST, listId);
  }

  async setListTitle(listId, title) {
    const SET_LIST_TITLE = "UPDATE todolists SET title = $2 WHERE id = $1";
    await dbQuery(SET_LIST_TITLE, listId, title); 
  }

  async validTitle(title) {
    const CHECK_TITLE = "SELECT * FROM todolists WHERE title = $1";
    let result = await dbQuery(CHECK_TITLE, title);
    return result.rowCount === 0;
  }

  uniqueConstraintViolation(error) {
    let regexp1 = new RegExp("unique", "gi");
    let regexp2 = new RegExp("constraint", "gi");
    return regexp1.test(String(error)) && regexp2.test(String(error));
  }
};