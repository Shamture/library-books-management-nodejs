const Sequelize = require('sequelize');
const sequelize = new Sequelize('librarybooksmanagement', 'root', '123456', {
    dialect: 'mysql'
});





const Book = sequelize.define('Book', {
  name: Sequelize.STRING,
  ISBN: Sequelize.STRING,
  Category : Sequelize.ENUM('Scientifique', 'Mathematiques','Histoire')
});



module.exports.addBook = function (name,isbn,category) {

return  sequelize.sync()
    .then(() => Book.create({
      name: name,
      ISBN: isbn,
      Category:category
    }))
    .then(book => {
      return book
    });

};
