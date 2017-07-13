const express = require('express')
const app = express()
const book = require('./Entities/Book.js')


// database connection
const Sequelize = require('sequelize');
const sequelize = new Sequelize('librarybooksmanagement', 'root', '123456', {
    dialect: 'mysql'
});


////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////  Models  ///////////////////////////////////////////////////////

const Book = sequelize.define('Book', {
  name: Sequelize.STRING,
  ISBN: Sequelize.STRING,
  Category : Sequelize.ENUM('Scientifique', 'Mathematiques','Histoire')
});




//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////  Book API  /////////////////////////////////////////////////////



app.post('/book', function (req, res) {

  console.log(req.body);
  Book.create({
    name: name,
    ISBN: isbn,
    Category:category
  })
  res.send('success');
});


//////////////// find book by category ////////////////
app.get('/book/category/:category', function (req, res) {
  Book.findAll({ where: { Category: req.params.category } }).then(books => {
  res.json(books);
  })
});



  //////////////// find book by ISBN ////////////////
  app.get('/book/ISBN/:isbn', function (req, res) {
    Book.findAll({ where: { ISBN: req.params.isbn } }).then(books => {
    res.json(books);
    })


});






////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////  Launch server ////////////////////////////////////////////////


app.listen(3000, function () {
  console.log('Listening on port 3000!')
})
