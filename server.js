var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Todo list');
});

app.get('/todos', function (req, res) {
    var query = req.query;
    var where = {};
    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.completed === 'false' && query.hasOwnProperty('completed')) {
        where.completed = false;
    }
    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%'
        };
    }
    db.todo.findAll({ where: where }).then(function (todos) {
        res.json(todos);
    }, function (err) {
        res.status(500).send(err);
    });
});


app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    db.todo.findById(todoId).then(function (todo) {
        if (!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        }
    }, function (err) {
        res.status(500).send(err);
    })
});

// POST /todos
app.post('/todos', function (req, res) {
    //picking the request body and assigning it to a variable
    var body = _.pick(req.body, 'description', 'completed');
    db.todo.create(body).then(function (todo) {
        res.json(todo.toJSON());
    }, function (err) {
        res.status(400).json(err);
    });
});

// DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    db.todo.destroy({
        where: {
            id: todoId
        }
    }).then(function (rowsDeleted) {
        if (rowsDeleted === 0) {
            res.status(404).json({ "error": 'Todo not found' });
        } else {
            res.status(204).send();
        }
    }, function (err) {
        res.status(500).send(err);
    });

});

// PUT /todos/:id
app.put('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }
    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    db.todo.findById(todoId).then(function (todo) {
        if (todo) {
            todo.update(attributes).then(function (todo) {
                res.json(todo.toJSON());
            }, function (err) {
                res.status(400).send(err);
            });
        } else {
            res.status(404).send();
        }
    }, function () {
        res.status(500).send();
    })
});

// POST/users
app.post('/users', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');
    db.user.create(body).then(function (user) {
        res.json(user.toPublicJSON());
    }, function (err) {
        res.status(400).json(err);
    });
});

// POST/users/login
app.post('/users/login', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');
    db.user.authenticate(body).then(function (user) {
        var token = user.generateToken('authentication');
        if (token) {
            res.header('Auth',).json(user.toPublicJSON());
        } else {
            res.status(401).send();
        }
    }, function (err) {
        res.status(400).json(err);
    })
});



db.sequelize.sync().then(function () {
    app.listen(PORT, function () {
        console.log('Server running on port' + PORT);
    });
})

