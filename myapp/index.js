const express = require('express')
const path = require('path');
const db = require('./queries')
const spoon = require('./yelp')
const app = express()
const port = 3000

// path.join(...) is to make directories relative to index.js rather
// than relative to terminal directory

// load up public CSS/JS files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));

// load up views
app.set('views', path.join(__dirname, '/views'))

// hook up EJS for dynamic HTML 
app.set('view engine', 'ejs');

// route views
app.get('/yelp', (req, res) => {
    res.send('Yelp API testing page!');
    spoon.getTodos();
   });
 
app.get('/users', db.getUsers)

app.get('/user/:accountId', (req, res) => {
    res.send('User: ' + req.params.accountId)
});

app.get('/', (req, res) => {
    const pageName = "Home";
    res.render('home.ejs', {pageInfo : pageName})

})

app.get('/restaurants', (req, res) => {
    const pageName = "Restaurants";
    res.render('restaurants.ejs', { pageInfo: pageName })
})

app.get('/recipes', (req, res) => {
    const pageName = "Recipes";
    res.render('recipes.ejs', { pageInfo: pageName })
})

app.get('/login', (req, res) => {
    const pageName = "Login";
    res.render('login.ejs', { pageInfo: pageName })
})

// get object including inputs of login form
app.post('/login', (req, res) => {
    res.send(req.body)
})

app.get('/register', (req, res) => {
    const pageName = "Register";
    res.render('register.ejs', { pageInfo: pageName })
})

// get object including inputs of registration form
app.post('/register', (req, res) => {
    res.send(req.body)
})


app.get('/test', (req, res) => {
    const pageName = "Test";
    res.render('test.ejs', { pageInfo: pageName })
})

// For any undefined pages, handle here
app.get('*', (req, res) => {
    const pageName = "Unkown";
    res.render('unknown.ejs', { pageInfo: pageName })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

// This app starts a server and listens on port 3000 for connections.
// For every other path, it will respond with a 404 Not Found.

