const express = require('express')
const app = express()
const book = require('./Entities/Book.js')


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



app.post('/book', function (req, res) {

  console.log(req.body);
  Book.create({
    name: name,
    ISBN: isbn,
    Category:category
  }).then(function (result) {
  // Transaction has been committed
  // result is whatever the result of the promise chain returned to the transaction callback
}).catch(function (err) {
  // Transaction has been rolled back
  // err is whatever rejected the promise chain returned to the transaction callback
});
 res.header("Access-Control-Allow-Origin", "*");
  res.send('success');
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






////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////  Launch server ////////////////////////////////////////////////


app.listen(3000, function () {
  console.log('Listening on port 3000!')
})
