const express = require('express')
const db = require('./queries')
const app = express()
const port = 3000

app.get('/', (req, res) => {
 res.send('Welcome to AggieEats!')
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

