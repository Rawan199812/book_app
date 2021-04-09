'use strict';
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');

const app = express();
const pg = require('pg');
const methodOverride = require('method-override');

const DATABASE_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV;
const client = new pg.Client(process.env.DATABASE_URL);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));

app.get('/', (req,res)=>{
  const sqlQuery = `SELECT * FROM tasks;`;
  client.query(sqlQuery)
    .then(result => {
      // console.log(result.rows[0]);
      res.render('pages/index', { oneBook: result.rows });
    }

    )
});
app.get('/searches/new', (req, res) => res.render('pages/searches/new'));

// search form in new and results in show searches
app.post('/searches', (req, res) => {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if (req.body.contact === 'Title') { url += `+intitle:${req.body.search}`; }
  if (req.body.contact === 'Author') { url += `+inauthor:${req.body.search}`; }
  superagent.get(url)
    .then(searchRes => searchRes.body.items.map(element => new Book(element.volumeInfo)))
    .then(results => {
      // console.log(results)
      res.render('pages/searches/show', { allResault: results })
    }).catch(error => {
      res.render('pages/error', { err: error })


    });
})

app.get('/books/:id', (req,res)=>{
  let idN = req.params.id;
  // console.log(idN);
  const sqlQuery = `SELECT * FROM tasks WHERE id=$1;`;
  client.query(sqlQuery, [idN])
    .then(result => {
      res.render('pages/books/show', { oneBook: result.rows });
      // console.log(result.rows);
    }).catch((error) => {
      errorHandler(`Error in getting Database ${error}`);
    });

});
app.put('/books/:id', (req,res)=>{
  let id = req.params.id;
  let { author, title, isbn, image_url, description } = req.body;
  let SQL = `UPDATE tasks SET author=$1,title=$2,isbn=$3,image_url=$4,description=$5 WHERE id =$6;`;
  let safeValues = [author, title, isbn, image_url, description, id];
  client.query(SQL, safeValues)
    .then(() => {
      res.redirect(`/books/${id}`);
    })
});


app.delete('/books/:id', (req,res)=>{
  let id = [req.params.id];
  let SQL = `DELETE FROM tasks WHERE id=$1;`;
  client.query(SQL, id)
    .then(() => {
      res.redirect('/');
    })
});



// app.get('/',(req,res)=>res.send('work'))

app.post('/books', (req,res)=>{
  const sqlQuery = 'INSERT INTO tasks (author,title,isbn,image_url, description)  VALUES ($1, $2, $3, $4,$5) RETURNING id';
  
  const sqlArr = [req.body.author, req.body.title, req.body.isbn, req.body.image, req.body.description]
  // console.log(sqlArr);
  client.query(sqlQuery, sqlArr)
  .then((result) => {
    
    res.redirect(`/books/${result.rows[0].id}`)
    //  res.redirect('/')
  });
});
app.get('*', (req, res) => res.status(404).send('This route does not exist'));

function Book(data) {
  this.image = data.imageLinks ? data.imageLinks.thumbnail : `https://i.imgur.com/J5LVHEL.jpg`;
  this.title = data.title ? data.title : 'No title was found'
  this.author = data.authors ? data.authors : '....';
  this.description = data.description ? data.description : 'No description was found';

  this.isbn = data.industryIdentifiers ? `${data.industryIdentifiers[0].type} ${data.industryIdentifiers[0].identifier}` : 'No ISBN found';
  booksArr.push(this);
  // console.log(this)
}

client.connect().then(() => app.listen(PORT, () => console.log(`Listening on port: ${PORT}`)));
