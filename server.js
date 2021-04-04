const express = require('express');
const superagent = require('superagent');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.get('/', renderPage);
app.use(express.static('public'));
app.get('/searches/new',(req,res)=> res.render('pages/searches/new'));
app.post('/searches', search);
app.get('*', (req, res) => res.status(404).send('This route does not exist'));

function renderPage(req, res) {
    res.render('pages/index');
}
// app.get('/',(req,res)=>res.send('work'))

 
  function search(req,res){
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';
    if (req.body.contact === 'title') { url += `+intitle:${req.body.search[0]}`; }
    if (req.body.contact === 'author') { url += `+inauthor:${req.body.search[0]}`; }
    superagent.get(url)
      .then(searchRes => searchRes.body.items.map(element => new Book(element.volumeInfo)))
      .then(results => res.render('pages/searches/show', { allResault: results })).catch(error=>{
        res.render('pages/error',{err:error})
    });
      
  }
  function Book(data) {
    this.image = data.imageLinks?data.imageLinks.thumbnail : `https://i.imgur.com/J5LVHEL.jpg`;
    this.title = data.title;
    this.author = data.authors;
    this.dicription = data.dicription;
    booksArr.push(this);
    console.log(this)
  }
 let booksArr = [];

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));