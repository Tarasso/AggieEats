const express = require('express')
const path = require('path');
const db = require('./queries')
const app = express()
const port = 3000

// path.join(...) is to make directories relative to index.js rather
// than relative to terminal directory

// load up public CSS/JS files
app.use(express.static(path.join(__dirname, 'public')))

// load up views
app.set('views', path.join(__dirname, '/views'))

// hook up EJS for dynamic HTML 
app.set('view engine', 'ejs');

// route views
app.get('/', (req, res) => {
 res.render('home.ejs')

})

app.get('/restaurants', (req, res) => {
    res.render('restaurants.ejs')
})

app.get('/recipies', (req, res) => {
    res.render('recipies.ejs')
})

// For any undefined pages, handle here
app.get('*', (req, res) => {
    res.send('Page not found :(')
   })

app.get('/users', db.getUsers)

app.get('/user/:accountId', (req, res) => {
res.send('User: ' + req.params.accountId)
});
   

app.listen(port, () => {
 console.log(`Example app listening at http://localhost:${port}`)
})

// This app starts a server and listens on port 3000 for connections.
// For every other path, it will respond with a 404 Not Found.

