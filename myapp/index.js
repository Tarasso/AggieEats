const express = require('express')
const path = require('path');
const db = require('./queries')
const yelp = require('./yelp')
const spoon = require('./spoonacular')
const cuisineData = require('./resources/cuisines.json');
const { searchRecipes } = require('./spoonacular');
const app = express()
const port = process.env.PORT || 3000

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
    yelp.getTodos();
   });

// app.get('/users', db.createNewUser)

app.get('/user/:accountId', (req, res) => {
    // spoon.searchRecipes("pasta","greek")
    // spoon.getRecipeDetails(654939)
    // db.storeRecipe(654939,"Pasta With Roasted Vegetables & Greek Olives")
    // db.getRecipeTitle(654939)
    res.send('User: ' + req.params.accountId)
});

app.get('/', (req, res) => {
    const pageName = "Home";
    res.render('home.ejs', {pageInfo : pageName})

})

app.get('/dashboard', (req, res) => {
    const pageName = "Dashboard";
    res.render('dashboard.ejs', { pageInfo: pageName })
})

app.get('/restaurants', (req, res) => {
    const pageName = "Restaurants";
    res.render('restaurants.ejs', { pageInfo: pageName })
})

app.get('/recipes', (req, res) => {
    const pageName = "Recipes";
    res.render('recipes.ejs', { pageInfo: pageName, cuisineData: cuisineData })
})

// get object including inputs of registration form
app.post('/recipes', (req, res) => {
    console.log("Received user input from post form.")
    res.send(req.body)
})

app.get('/login', (req, res) => {
    const pageName = "Login";
    res.render('login.ejs', { pageInfo: pageName })
})

// get object including inputs of login form
app.post('/login', (req, res) => {
    console.log("Received user input from login form.")
    db.login(req.body)
    res.send(req.body)
})

app.get('/register', (req, res) => {
    const pageName = "Register";
    res.render('register.ejs', { pageInfo: pageName })
})

// get object including inputs of registration form
app.post('/register', (req, res) => {
    console.log("Received user input from registration form.")
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
