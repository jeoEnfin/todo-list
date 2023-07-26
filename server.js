var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Todo list');
});

app.get('/todos', function (req, res) {
    var queryParams = req.query;
    var filterdTodos = todos;
    if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filterdTodos = _.where(filterdTodos, { completed: true });
    } else if (queryParams.completed === 'false' && queryParams.hasOwnProperty('completed')) {
        filterdTodos = _.where(filterdTodos, { completed: false });
    }

    if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        filterdTodos = _.filter(filterdTodos, function (todo) {
            return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
        })
    }

    res.json(filterdTodos);
});

// GET /todos/:id

app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);

    //using underscore's findWhere method to find the todo with the given id
    var matchedTodo = _.findWhere(todos, { id: todoId });

    if (matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }

});

// POST /todos
app.post('/todos', function (req, res) {

    //picking the request body and assigning it to a variable
    var body = _.pick(req.body, 'description', 'completed');

    //using underscore for validation
    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
        return res.status(400).send();
    }

    body.description = body.description.trim();

    //adding the new todo to the array
    body.id = todoNextId++;
    todos.push(body);
    res.json(body);
});

// DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, { id: todoId });
    if (!matchedTodo) {
        return res.status(404).json({ "error": 'Todo not found' });
    } else {
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo);
    }

});

// PUT /todos/:id
app.put('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, { id: todoId });
    var body = _.pick(req.body, 'description', 'completed');
    var validAttributes = {};

    if (!matchedTodo) {
        return res.status(400).send();
    }

    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    }

    // Here we have a valid todo to update
    _.extend(matchedTodo, validAttributes);
    res.json(matchedTodo);


});

app.listen(PORT, function () {
    console.log('Server running on port' + PORT);
});