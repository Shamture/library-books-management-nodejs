const express = require('express')
const app = express()
const book = require('./Entities/Book.js')

var hash = require('hash.js')

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
const fs = require('fs');


const nodemailer = require('nodemailer');

var config = require('./config.js');

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
  printer: Sequelize.STRING,
  publicationPlace: Sequelize.STRING,
  pagesNumber : Sequelize.INTEGER,
  dimension: Sequelize.STRING,
  keywords: Sequelize.STRING,
  languages: Sequelize.STRING,
  description: Sequelize.STRING,
  placeInTheLibrary: Sequelize.STRING,
  category : Sequelize.ENUM('Scientifique', 'Mathematiques','Histoire'),
  count : Sequelize.INTEGER
});


const Person = sequelize.define('Personn', {
  name: Sequelize.STRING,
  username:Sequelize.STRING,
  password:Sequelize.STRING,
  email:Sequelize.STRING,
  isActivated:{ type: Sequelize.BOOLEAN, defaultValue: false},
  strikes:Sequelize.INTEGER,
  validationKey:Sequelize.STRING,
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

// get the decoded payload ignoring signature, no secretOrPrivateKey needed 
var token = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibmFtZSI6IlBlcnNvbiAyIiwidXNlcm5hbWUiOiJwZXJzb24yIiwicGFzc3dvcmQiOiI5ZWNhNTRjMTU2ZmZiNzVkMjJiZTQ3YTA5YzA2ZDU2MDA5ZjM4MzFmY2Y1OGI2MDBmNTBkZjExODEyOWFkZGNkZmI2MjFmNWJjZDUxZTdkYWNiNmI0Nzg3YzkxYzIyNGM5NmIwNDUxOWQ4ZDQ1MDJkYmE4ZDhiNmU1N2QyMmVmMiIsInR5cGUiOiJTdHVkZW50IiwiY3JlYXRlZEF0IjoiMjAxNy0wNy0xOVQwMDowMDowMC4wMDBaIiwidXBkYXRlZEF0IjoiMjAxNy0wNy0xOVQwMDowMDowMC4wMDBaIiwiaWF0IjoxNTAxMDc1NzE3fQ.i5DrxYrmBC6K8u0T4azMPKW2a2pEwjAGCEsaPERvSLzEwLjXs7Z2WykuT-1Vl9pUGTu97Xp0pasJ4EyQLW-sod_FCXcKqPP075MbJv5JVaHRBy9c0LZ4bSV4zXoYXAEKv5448ymRUMlrG8GoDmKzKisGa4IfrSEeTr76OvIpiqiPyTj9BgfCodFFNOCnkfAKqBkcKen58Cp17eXwio92nPDxxHsOBsUtV-BsV6piImyDk-3WGWg69oLPDFvkhXVM664ecXimPCdiflufopNmuxvHzYBTpSf3_B-p4XZFPdGvvjU_iNCA5FiqP6WADazC3xibxTecFfEQfPgxoRnWaw';
 
// alg mismatch 
var cert = fs.readFileSync('key.pub');  // get public key 
jwt.verify(token, cert, function(err, decoded) {
  console.log(decoded) // bar 
});
 
 
 
 



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
else if (!person.isActivated)
{
result={"login":false,"activated":false}
 res.json(result);
}
else {
 
 // result={"login":true,"user":person.dataValues.username}
 // We are sending the profile inside the token
var cert = fs.readFileSync('key.pem');  // get private key  
var token = jwt.sign(person.dataValues,cert, { algorithm: 'RS512'});
 
 
 
console.log(token)
  res.json({ login:true,token: token });
 
}



}).then(function (result) {
// Transaction has been committed
// result is whatever the result of the promise chain returned to the transaction callback
}).catch(function (err) {
// Transaction has been rolled back
// err is whatever rejected the promise chain returned to the transaction callback
});
});





////////// activate user account 

app.get('/login/validation/:key', function (req, res) {
  


res.header("Access-Control-Allow-Origin", "*");
result={"success":false}

Person.find({ where: { validationKey: req.params.key } })
  .then(person => {
    // Check if record exists in db
    if (person!=null) {
      person.updateAttributes({isActivated: true})
      result={"success":true}
    }

	 res.json(result);
  })






})




//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////  Book API  /////////////////////////////////////////////////////


/// add new book
app.post('/book', function (req, res) {

  console.log(req.body);
  Book.create({
    name: req.body.name,
    printer: req.body.printer,
    publicationPlace: req.body.publicationPlace,
    pagesNumber: req.body.pagesNumber,
    dimension: req.body.dimension,
    keywords: req.body.keywords,
    languages: req.body.languages,
    description: req.body.description,
    placeInTheLibrary: req.body.placeInTheLibrary,
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


//////////////// find book by keywords ////////////////
    app.get('/book/keywords/:keywords/:page', function (req, res) {
      Book.findAndCountAll({ where: { keywords:{$like: '%'+req.params.keywords+'%'} } , limit: 20, offset: (req.params.page-1)*20}).then(books => {
    res.header("Access-Control-Allow-Origin", "*");
      res.json(books);
      })

});




//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////  Person API  /////////////////////////////////////////////////////



/// add new person
app.post('/person', function (req, res) {

  console.log(req.body);
//generate validation key

let validationK = Math.random() * (99999999999999999999 - 11111111111111111111) + 11111111111111111111+hash.sha512().update(req.body.username).digest('hex');

  Person.create({
    name: req.body.name,
    username: req.body.username,
    password: hash.sha512().update(req.body.password).digest('hex'),
    validationKey:validationK,
    email: req.body.email,
    type: req.body.type

  }).then(function (result) {

/// send confirmation email to user

let transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: false, 
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
});


let mailOptions = {
    from: '"Library books management" <'+config.email.user+'>', // sender address
    to: req.body.email, // list of receivers
    subject: 'account confirmation', // Subject line

    html: 'please click the following link to confirm your account : <br/> http://localhost:4200/validateRegistration/'+validationK,
};

 

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
 
    if (error) {
        return console.log(error);
 const sucess = { "success":false};
  res.json(sucess);
    }

    console.log('Message %s sent: %s', info.messageId, info.response);


});


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


////// return  book


/// borrow book
app.post('/returnbook', function (req, res) {

  res.header("Access-Control-Allow-Origin", "*");

  console.log(req.body);


///  find the book to return
  PersonBook.find({ where: { BookIsbn: req.body.isbn, PersonnId: req.body.id}

  }).then(personbook => {

personbook.updateAttributes({status: 'returned'})



// increment the books count
sequelize.query('UPDATE Books SET count = count+1 WHERE isbn = $1 ',{ bind: [personbook.BookIsbn], type: sequelize.QueryTypes.UPDATE })



if(personbook.finishDate<Date.now()){
	//strike
Person.find({ where: { id: req.body.id }
 }).then(person => {

person.updateAttributes({strikes: person.strikes+1})
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





//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////  Email API  /////////////////////////////////////////////////////


/// send email 
app.post('/email', function (req, res) {

 

 // create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: false, // secure:true for port 465, secure:false for port 587
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
});

console.log(req.body.file);
// setup email data with unicode symbols
let mailOptions = {
    from: '"Library books management" <'+config.email.user+'>', // sender address
    to: req.body.receiver, // list of receivers
    subject: req.body.subject, // Subject line
    text: req.body.emailContent, // plain text body
    html: '<b>*</b>', // html body
 attachments: [
        {
        filename:'file.pdf',    
	content: req.body.file,
        encoding: 'binary'
        }]

};

 

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
 
    if (error) {
        return console.log(error);
 const sucess = { "success":false};
  res.json(sucess);
    }

    console.log('Message %s sent: %s', info.messageId, info.response);

 res.header("Access-Control-Allow-Origin", "*");
 const sucess = { "success":true};
  res.json(sucess);

});

});



////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////  Launch server ////////////////////////////////////////////////


app.listen(3000, function () {
  console.log('Listening on port 3000!')
})
