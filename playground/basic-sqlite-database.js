var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [1, 250]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

sequelize.sync({force: true}).then(function () {
    console.log('Database synced!');

    Todo.create({
        description: 'Learn Sequelize',
        completed: false
    }).then(function (todo) {
        console.log('Finished syncing');
        console.log(todo);
    }).catch (function(error) {
        console.log(error);
    });
});