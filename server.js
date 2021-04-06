'use strict';
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');

const app = express();
const pg = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
// app.get('/', renderPage);
app.use(express.static('public'));
app.get('/', renderAllBooks);
app.get('/searches/new', (req, res) => res.render('pages/searches/new'));
app.post('/searches', search);
app.get('/books/:id', seeDetails);
app.get('*', (req, res) => res.status(404).send('This route does not exist'));
const NODE_ENV = process.env.NODE_ENV;

// function renderPage(req, res) {
//     res.render('pages/index');
// }
// const options = NODE_ENV === 'production' ? { connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } } : { connectionString: DATABASE_URL };

const client = new pg.Client(process.env.DATABASE_URL);
function renderAllBooks(req, res) {
  const sqlQuery = `SELECT * FROM tasks;`;
  client.query(sqlQuery).then(

    result => {
      // console.log(result.rows[0]);
      res.render('pages/index', { oneBook: result.rows })
    }
  )
}
// app.get('/',(req,res)=>res.send('work'))

function seeDetails(req, res) {

  let idN = req.params.id;
  // console.log(idN);
  const sqlQuery = `SELECT * FROM tasks WHERE id=$1;`;
  client.query(sqlQuery, [idN])
    .then(result => {
      res.render('pages/books/show', { oneBook: result.rows });
    }).catch((error) => {
      errorHandler(`Error in getting Database ${error}`);
    });
  app.post('/books', addBook);
  function addBook(req, res) {
    const sqlQuery = 'INSERT INTO tasks (title, description, author, image_url) VALUES ($1, $2, $3, $4) RETURNING id';
    const sqlArr = [req.body.title, req.body.description, req.body.author, req.body.image_url]
    client.query(sqlQuery, sqlArr)
      .then(() => {
        // res.render('pages/books/show',{oneBook:[req.body]})
         res.redirect('/')
      });



  }

}
console.log('hi');
function search(req, res) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if (req.body.contact === 'Title') { url += `+intitle:${req.body.search[0]}`; }
  if (req.body.contact === 'Author') { url += `+inauthor:${req.body.search[0]}`; }
  superagent.get(url)
    .then(searchRes => searchRes.body.items.map(element => new Book(element.volumeInfo)))
    .then(results =>
     
      { console.log(results)
        res.render('pages/searches/show', { allResault: results })}).catch(error => {
      res.render('pages/error', { err: error })

    });
}
function Book(data) {
  this.image = data.imageLinks ? data.imageLinks.thumbnail : `https://i.imgur.com/J5LVHEL.jpg`;
  this.title = data.title;
  this.author = data.authors;
  this.description = data.description;
  booksArr.push(this);
  // console.log(this)
}
let booksArr = [];

client.connect().then(() => app.listen(PORT, () => console.log(`Listening on port: ${PORT}`)));