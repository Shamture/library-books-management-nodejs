const express = require('express')
const app = express()
const book = require('./Entities/Book.js')

var hash = require('hash.js')

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
  username:Sequelize.STRING,
  password:Sequelize.STRING,
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
////////////////////////////  Login API  /////////////////////////////////////////////////////


//////////////// login ////////////////
app.post('/login', function (req, res) {

  Person.find({ where: { username: req.body.username ,password:hash.sha512().update(req.body.password).digest('hex')}
  }).then(person => {
 res.header("Access-Control-Allow-Origin", "*");

result={"login":false}

if(person==null)
 res.json(result);
else {
  result={"login":true,"user":person.dataValues.username}

  res.json(result);
}



}).then(function (result) {
// Transaction has been committed
// result is whatever the result of the promise chain returned to the transaction callback
}).catch(function (err) {
// Transaction has been rolled back
// err is whatever rejected the promise chain returned to the transaction callback
});
});




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

  const sucess = { "success":true};
  res.json(sucess);


}).catch(function (err) {
console.log(err);
const sucess = { "success":false};
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
  Book.findAll({ where: { name:{$like: '%'+req.params.name+'%'}  } }).then(books => {
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

  const sucess = { "success":true};
  res.json(sucess);


}).catch(function (err) {
console.log(err);
const sucess = { "success":false};
res.json(sucess);

});
 res.header("Access-Control-Allow-Origin", "*");

});





//////////////// find person by username ////////////////
app.get('/person/username/:username', function (req, res) {
  Person.findAll({ where: { username: req.params.username }
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



//////////////// find person by name ////////////////
app.get('/person/namelike/:name', function (req, res) {

  Person.findAll({  where: { name:{$like: '%'+req.params.name+'%'}  }}).then(persons => {
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



//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////  Borrow API  /////////////////////////////////////////////////////




/// borrow book
app.post('/borrow', function (req, res) {

  res.header("Access-Control-Allow-Origin", "*");

  console.log(req.body);


///  find the book to borrow
  Book.find({ where: { ISBN: req.body.isbn }

  }).then(book => {

// check if the book is available or not
if(book.dataValues.count > 0)
{
console.log("the book to borrow is "+book.dataValues.name);

// find the person that will borrow the book
 Person.find({ where: { username: req.body.username }
 }).then(person => {

console.log(book.dataValues.name+" to mr "+person.dataValues.name);

book.addPersonn(person, { through: { status: 'borrowed' , startDate : sequelize.fn('NOW') , finishDate : req.body.finishDate}});

// decrement the books count
sequelize.query('UPDATE Books SET count = count-1 WHERE isbn = $1 ',{ bind: [book.dataValues.isbn], type: sequelize.QueryTypes.UPDATE })


 })
}



}).then(function (result) {

  const sucess = { "success":true};
  res.json(sucess);


}).catch(function (err) {
console.log(err);
const sucess = { "success":false};
res.json(sucess);

});

});


/*
book.getPersonns().then(function (projects) {
  console.log(projects[0].dataValues.name);
})

*/




/// Follow-up books
app.get('/follow-up', function (req, res) {
      Book.findAll({  include: [{ model: Person ,required: true}]   }).then(followup => {
    res.header("Access-Control-Allow-Origin", "*");
      res.json(followup);
      });

});

////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////  Launch server ////////////////////////////////////////////////


app.listen(3000, function () {
  console.log('Listening on port 3000!')
})
