const express = require('express');
const superagent = require('superagent');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.get('/', renderPage);
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
function renderPage(request, response) {
    response.render('pages/index');
}
  

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));