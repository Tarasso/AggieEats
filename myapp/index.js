const express = require('express')
const path = require('path');
const db = require('./queries')
const yelp = require('./yelp')
const spoon = require('./spoonacular')
const cuisineData = require('./resources/cuisines.json');
const { searchRecipes } = require('./spoonacular');
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')
const session = require('express-session');
const { Console } = require('console');
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
    yelp.searchRestaurants('thai food',1.5);
    // spoon.searchRecipes("pasta","greek")
    // spoon.getRecipeDetails(654939)

   });

// app.get('/test', async (req, res) => {
// res.send('Welcome to the testing page!');
// // db.getAverageUserRating("test2@gmail.com")
// // db.getTotalRecipes("test2@gmail.com")
// // db.getAverageRating(2);
// // db.getRecentReview(2);
// // await db.leaveReview("t@t.com",2,"It was meh",1,false)
// // await db.leaveReview("t@t.com",3,"It was okay",1,false)
// // await db.leaveReview("t@t.com",1,"It was terrible",1,false)
// // db.getTopUsers(5);
// // db.getTopUsers(5,"t@t.com")
// db.getRecipeLibrary("lc@test.com");
// // db.addToLibrary("lc@test.com",654939);
// // let temp = {
// //     "email": "kylemrosko@gmail.com",
// //     "password": "password",
// //     "firstName": "Kyle",
// //     "lastName": "Mrosko"
// // }
// // db.requestNewAccount(temp);
// // spoon.searchRecipes("sandwich")
// // spoon.getRecipeDetails(654939)

// });

// set up cookie parser, sessions, and flash middlewares
//app.use(cookieParser())
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))
app.use(flash());

// middleware to insert flash to all routes
app.use((req, res, next) => {
    res.locals.flashSuccess = req.flash('flashSuccess');
    res.locals.flashWarn = req.flash('flashFail');
    res.locals.userAccount = req.session.user
    next();
})

// app.get('/users', db.createNewUser)

app.get('/user/:accountId', (req, res) => {
    res.send('User: ' + req.params.accountId)
});

app.get('/', async (req, res) => {
    const pageName = "Home";
    const topUsers = await db.getTopUsers(10);
    res.render('home.ejs', {pageInfo : pageName, topUsers})

})

app.get('/dashboard', async (req, res) => {
    if (!req.session.user) {
        console.log("You must be logged in.")
        req.flash('flashFail', 'You must be logged in to access dashboard.')
        res.redirect('/login');
    } else {
        const pageName = "Dashboard";
        const topUsers = await db.getTopUsers(10);
        res.render('dashboard.ejs', { pageInfo: pageName, topUsers })
    }
})

app.get('/restaurants', (req, res) => {
    const pageName = "Restaurants";
    res.render('restaurants.ejs', { pageInfo: pageName })
})

app.get('/recipes/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const pageName = "Recipe Details";
    console.log(id)
    try {
        const spoon_results = await spoon.getRecipeDetails(id)
        res.render('recipe_details.ejs', { pageInfo: pageName, spoon_results })
    } catch (error) {
        res.send(error)
    }

})

app.get('/recipes', async (req, res) => {
    const pageName = "Recipes";
    var spoon_results
    if ('recipe_query' in req.query) {
        try {
            spoon_results = await spoon.searchRecipes(req.query.recipe_query, req.query.cuisine_type)
        } catch (error) {
            return res.send(error)
        }
    } else {
    }
    // res.send(spoon_results)
    res.render('recipes.ejs', { pageInfo: pageName, cuisineData, spoon_results, query: req.query })
})



// get object including inputs of registration form
// app.post('/recipes', (req, res) => {
//     console.log("Received user input from post form.")
//     res.send(req.body)
// })

app.get('/login', (req, res) => {
    const pageName = "Login";
    res.render('login.ejs', { pageInfo: pageName })
})

app.get('/logout', async (req, res) => {
    if (!req.session.user) {
        res.redirect('/')
        return;
    }
    req.session.destroy();
    const pageName = "Logged out";
    res.locals.userAccount = null
    res.render('logout.ejs', { pageInfo: pageName })
})

app.post('/login', async (req, res) => {
    const loginResult = await db.login(req.body)
    if (loginResult != null) {
        req.flash('flashSuccess', 'Successfully logged in!')
        console.log("Login result: " + loginResult);
        req.session.user = loginResult;
        res.redirect('/dashboard')
    } else {
        req.flash('flashFail', 'Incorrect email or password.')
        res.redirect('/login');
    }
})

app.get('/register', (req, res) => {
    const pageName = "Register";
    res.render('register.ejs', { pageInfo: pageName })
})

app.post('/register', async (req, res) => {
    console.log("Received user input from registration form.")

    const registerResult = await db.requestNewAccount(req.body)

    if (registerResult != null) {
        req.flash('flashSuccess', 'Successfully registered! Welcome!')
        req.session.user = registerResult;
        res.redirect('/dashboard')
    } else {
        req.flash('flashFail', 'There is already an account using this e-mail.')
        res.redirect('/register');
    }

})

app.get('/test', async (req, res) => {
    const spoon_results = await spoon.getRecipeDetails(654939)
    res.render(spoon_results)
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
