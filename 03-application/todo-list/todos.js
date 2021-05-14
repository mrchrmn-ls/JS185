/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
const express = require("express");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const { body, validationResult } = require("express-validator");
const store = require("connect-loki");
const SessionPersistence = require("./lib/session-persistence");

const { sortByTitle, sortByStatus } = require("./lib/sort");

const app = express();
const HOST = "localhost";
const PORT = 3000;
const LokiStore = store(session);

app.set("view engine", "pug");
app.set("views", "./views");

app.use(morgan("common"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.use(session({
  cookie: {
    httpOnly: true,
    maxAge: 31 * 24 * 3600000,
    path: "/",
    secure: false
  },
  name: "launch-school-todos-session-id",
  resave: false,
  saveUninitialized: true,
  secret: "This really isn't secure at all",
  store: new LokiStore({})
}));

app.use(flash());


// Create a new datastore
app.use((req, res, next) => {
  res.locals.store = new SessionPersistence(req.session);
  next();
});


// Set up flash messages
app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});


// Redirect start page
app.get("/", (_req, res) => {
  res.redirect("/lists");
});


// Display all lists
app.get("/lists", (_req, res) => {
  let store = res.locals.store;
  let todoLists = store.getSortedLists();

  let todosInfo = todoLists.map(list => ({
    countAllTodos: list.todos.length,
    countDoneTodos: list.todos.filter(todo => todo.done).length,
    isDone: store.listDone(list)
  }));

  res.render("lists", { todoLists, todosInfo });
});


// Display new list form
app.get("/lists/new", (_req, res) => {
  res.render("new-list");
});


//Display single list
app.get("/lists/:todoListId", (req, res, next) => {
  let store = res.locals.store;
  let listId = Number(req.params.todoListId);
  let list = store.getListFromId(listId);

  if (!list) {
    next(new Error("Todo list not found."));
  } else {
    res.render("list", {
      todoList: list,
      listDone: store.listDone(list),
      somethingLeftToDo: store.somethingLeftToDo(list),
      todos: sortByStatus(sortByTitle(list.todos))
    });
  }
});


// Display list editing view
app.get("/lists/:todoListId/edit", (req, res, next) => {
  let listId = Number(req.params.todoListId);
  let list = res.locals.store.getListFromId(listId);

  if (!list) {
    next(new Error("Todo list not found."));
  } else {
    res.render("edit-list", {
      todoList: list
    });
  }
});


// Delete todo list
app.post("/lists/:todoListId/destroy", (req, res, next) => {
  let store = res.locals.store;
  let listId = Number(req.params.todoListId);
  let list = store.getListFromId(listId);

  if (!list) {
    next(new Error("Todo list not found."));
  } else {
    store.deleteList(listId);
    req.flash("success", `List "${list.title}" deleted.`);
    res.redirect("/lists");
  }
});


// Edit title of todo list
app.post("/lists/:todoListId/edit",
  [
    body("todoListTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("You need to provide a title.")
      .isLength({ max: 100 })
      .withMessage("Title must be shorter than 100 characters.")
  ],
  (req, res, next) => {
    let store = res.locals.store;
    let listId = Number(req.params.todoListId);
    let list = store.getListFromId(listId);
    let title = req.body.todoListTitle;

    const reRenderEditList = () => {
      res.render("edit-list", {
        flash: req.flash(),
        todoListTitle: title,
        todoList: list
      });
    };

    if (!list) {
      next(new Error("Todo list not found."));
    } else {
      let errors = validationResult(req);

      if (!store.validTitle(title)) {
        req.flash("error", "A list with this title already exists.");
        reRenderEditList();
      } else if (!errors.isEmpty()) {
        errors.array().forEach(message => req.flash("error", message.msg));
        reRenderEditList();
      } else {
        req.flash("success", `"${list.title}" has been renamed "${title}".`);
        store.setListTitle(listId, title);
        res.redirect("/lists");
      }
    }
  }
);


// Mark all todo items as done
app.post("/lists/:todoListId/complete_all", (req, res, next) => {
  let store = res.locals.store;
  let listId = Number(req.params.todoListId);
  let list = store.getListFromId(listId);

  if (!list) {
    next(new Error("Todo list not found."));
  } else {
    store.markListDone(listId);
    res.redirect(`/lists/${listId}`);
  }
});


// Toggle status of todo item
app.post("/lists/:todoListId/todos/:todoId/toggle", (req, res, next) => {
  let store = res.locals.store;
  let todoId = Number(req.params.todoId);
  let listId = Number(req.params.todoListId);
  let list = store.getListFromId(listId);

  if (!list) {
    next(new Error("Todo list not found."));
  } else {
    let todo = store.getTodoFromList(todoId, list);
    if (!todo) {
      next(new Error("Todo item not found."));
    } else {
      store.toggleTodo(listId, todoId);
      if (req.body.done) {
        req.flash("success", `"${todo.title}" marked complete.`);
      } else {
        req.flash("success", `"${todo.title}" unchecked.`);
      }
      res.redirect(`/lists/${listId}`);
    }
  }
});


// Delete todo item
app.post("/lists/:todoListId/todos/:todoId/destroy", (req, res, next) => {
  let store = res.locals.store;
  let todoId = Number(req.params.todoId);
  let listId = Number(req.params.todoListId);
  let list = store.getListFromId(listId);

  if (!list) {
    next(new Error("Todo list not found."));
  } else {
    let todo = store.getTodoFromList(todoId, list);
    if (!todo) {
      next(new Error("Todo item not found."));
    } else {
      store.deleteTodo(listId, todoId);
      req.flash("success", `"${todo.title}" removed from list.`);
      res.redirect(`/lists/${listId}`);
    }
  }
});


// Add new todo item
app.post("/lists/:todoListId/todos",
  [
    body("todoTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("You need to name your todo item.")
      .isLength({ max: 100 })
      .withMessage("Item name must not exceed 100 characters.")
  ],
  (req, res, next) => {
    let store = res.locals.store;
    let listId = Number(req.params.todoListId);
    let list = store.getListFromId(listId);

    if (!list) {
      next(new Error("Todo list not found."));
    } else {
      let title = req.body.todoTitle;
      let errors = validationResult(req);

      if (!errors.isEmpty) {
        errors.array().forEach(message => req.flash("error", message.msg));
        res.render(`/lists/${listId}`, {
          flash: req.flash(),
          todoTitle: title
        });
      } else {
        store.addTodo(listId, title);
        req.flash("success", `"${title}" added to list.`);
        res.redirect(`/lists/${listId}`);
      }
    }

  }
);


// Add new list
app.post("/lists",
  [
    body("todoListTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("You need to provide a title.")
      .isLength({ max: 100 })
      .withMessage("Title must be shorter than 100 characters.")
  ],
  (req, res) => {
    let title = req.body.todoListTitle;
    let errors = validationResult(req);
    let store = res.locals.store;

    const reRenderNewList = () => {
      res.render("new-list", {
        flash: req.flash(),
        todoListTitle: title
      });
    };

    if (!store.validTitle(title)) {
      req.flash("error", "There is already a list with this title.");
      reRenderNewList();
    } else if (!errors.isEmpty()) {
      errors.array().forEach(message => req.flash("error", message.msg));
      reRenderNewList();
    } else {
      store.newList(title);
      req.flash("success", `The list "${title}" has been added.`);
      res.redirect("/lists");
    }
  }
);


// Error handler
app.use((err, _req, res, _next) => {
  console.log(err);
  res.status(404)
     .send(err.message);
});


// Listener
app.listen(PORT, HOST, () => {
  console.log(`Todos listening on port ${PORT} of ${HOST}.`);
});