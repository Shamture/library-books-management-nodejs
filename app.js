const express = require('express')
const app = express()
const book = require('./Entities/Book.js')

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////  database ////////////////////////////////////////////////

const Sequelize = require('sequelize');
const sequelize = new Sequelize('librarybooksmanagement', 'root', '123456', {
    dialect: 'mysql'
});


////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////  Models  ///////////////////////////////////////////////////////

const Book = sequelize.define('Book', {
  isbn: { type: Sequelize.STRING, primaryKey: true },
  name: Sequelize.STRING,
  category : Sequelize.ENUM('Scientifique', 'Mathematiques','Histoire'),
  count : Sequelize.INTEGER
});


const Person = sequelize.define('Personn', {
  name: Sequelize.STRING,
  type : Sequelize.ENUM('Student', 'Researcher')

});



const PersonBook = sequelize.define('PersonBook', {
    status: Sequelize.STRING,
    startDate : Sequelize.DATE,
    finishDate : Sequelize.DATE
})


Book.belongsToMany(Person, {through: PersonBook})


Book.sync()
Person.sync()
PersonBook.sync()



//////////////////  associations ////////////





//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////  Book API  /////////////////////////////////////////////////////


/// add new book
app.post('/book', function (req, res) {

  console.log(req.body);
  Book.create({
    name: req.body.name,
    isbn: req.body.isbn,
    category:req.body.category,
    count:req.body.count
  }).then(function (result) {

  const sucess = { "sucess":true};
  res.json(sucess);


}).catch(function (err) {
console.log(err);
const sucess = { "sucess":false};
res.json(sucess);

});
 res.header("Access-Control-Allow-Origin", "*");

});


//////////////// find book by category ////////////////
app.get('/book/category/:category', function (req, res) {
  Book.findAll({ where: { Category: req.params.category }
  }).then(books => {
 res.header("Access-Control-Allow-Origin", "*");
 res.json(books);
}).then(function (result) {
// Transaction has been committed
// result is whatever the result of the promise chain returned to the transaction callback
}).catch(function (err) {
// Transaction has been rolled back
// err is whatever rejected the promise chain returned to the transaction callback
});
});



  //////////////// find book by ISBN ////////////////
  app.get('/book/ISBN/:isbn', function (req, res) {
    Book.findAll({ where: { ISBN: req.params.isbn } }).then(books => {
 res.header("Access-Control-Allow-Origin", "*");
    res.json(books);
    })
});

    //////////////// find book by name ////////////////
    app.get('/book/name/:name', function (req, res) {
      Book.findAll({ where: { name:req.params.name  } }).then(books => {
    res.header("Access-Control-Allow-Origin", "*");
      res.json(books);
      })

});


//////////////// find book by LIKE name ////////////////
app.get('/book/namelike/:name', function (req, res) {
  Book.findAll({ where: { name:{$like: '%'+req.params.name}  } }).then(books => {
res.header("Access-Control-Allow-Origin", "*");
  res.json(books);
  })

});







//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////  Person API  /////////////////////////////////////////////////////


/// add new person
app.post('/person', function (req, res) {

  console.log(req.body);
  Person.create({
    name: req.body.name,
    type: req.body.type

  }).then(function (result) {

  const sucess = { "sucess":true};
  res.json(sucess);


}).catch(function (err) {
console.log(err);
const sucess = { "sucess":false};
res.json(sucess);

});
 res.header("Access-Control-Allow-Origin", "*");

});





//////////////// find person by id ////////////////
app.get('/person/id/:id', function (req, res) {
  Person.findAll({ where: { id: req.params.id }
  }).then(persons => {
 res.header("Access-Control-Allow-Origin", "*");
 res.json(persons);
}).then(function (result) {
// Transaction has been committed
// result is whatever the result of the promise chain returned to the transaction callback
}).catch(function (err) {
// Transaction has been rolled back
// err is whatever rejected the promise chain returned to the transaction callback
});
});







////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////  Launch server ////////////////////////////////////////////////


app.listen(3000, function () {
  console.log('Listening on port 3000!')
})
