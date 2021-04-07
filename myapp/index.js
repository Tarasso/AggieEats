const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
 res.send('Welcome to AggieEats!')
})

app.get('/account', (req, res) => {
    res.send('Default User Page!')
   });

app.get('/account/:accountId', (req, res) => {
res.send('User account: ' + req.params.accountId)
});
   

app.listen(port, () => {
 console.log(`Example app listening at http://localhost:${port}`)
})

// This app starts a server and listens on port 3000 for connections.
// For every other path, it will respond with a 404 Not Found.

