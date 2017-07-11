const express = require('express')
const app = express()
const book = require('./Entities/Book.js')



app.get('/', function (req, res) {



res.json(book.addBook('aa','bbb','Scientifique'))


//})



})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
