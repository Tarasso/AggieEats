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
const { resolveNaptr } = require('dns');
const { DH_UNABLE_TO_CHECK_GENERATOR } = require('constants');
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

app.get('/test', (req, res) => {
    res.send('Welcome to the testing page!');
    // db.storeRecipe('S37tD90W3dQJw6r0Ir7-9g','555 Grill');
    yelp.surpriseMe("lc@test.com");
    // db.RestaurantExists('S37tD90W3dQJw6r0Ir7-9g')
 });

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


const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        req.flash('flashFail', 'You must be logged in to access this page.')
        return res.redirect('/login');
    }
    next();
}


// app.get('/users', db.createNewUser)

app.get('/user/:accountId', (req, res) => {
    res.send('User: ' + req.params.accountId)
});

app.get('/', async (req, res) => {
    const pageName = "Home";
    const topUsers = await db.getTopUsers(10);
    res.render('home.ejs', {pageInfo : pageName, topUsers})

})

app.get('/dashboard', requireLogin, async (req, res) => {
        const pageName = "Dashboard";
        const topUsers = await db.getTopUsers(10, req.session.user.email);
        console.table(topUsers)
        const library = await db.getRecipeLibrary(req.session.user.email);
        const totalRestaurants = await db.getTotalRestaurants(req.session.user.email);
        const totalRecipes = await db.getTotalRecipes(req.session.user.email);
        const averageRatings = await db.getAverageUserRating(req.session.user.email);
        var stats = {totalRestaurants: totalRestaurants, totalRecipes: totalRecipes, averageRatings: averageRatings}
        console.log(stats)
        console.log("Library" + library)
        res.render('dashboard.ejs', { pageInfo: pageName, topUsers, library, stats })
})

app.get('/restaurants', requireLogin, async (req, res) => {
    const pageName = "Restaurants";
    var yelp_results;
    var distance = (req.query.distance == undefined) ? (25) : req.query.distance

    if('foodName' in req.query){
        console.log(req.query, distance)
        
        try {
            yelp_results = await yelp.searchRestaurants(req.query.foodName, distance)

        } catch (error) {
            return res.send(error)
        }
    } 
    res.render('restaurants.ejs', { pageInfo: pageName, yelp_results})
})

app.get('/recipes/:id', requireLogin, async (req, res) => {
    console.log("viewing recipe: '" + req.params.id + "'")
    const pageName = "Recipe Details";
    var spoon_results;
    try {
        const id = parseInt(req.params.id);
        // if session has recipe detail info for this ID already, then retrieve that
        if (req.session.recipe_details && req.session.recipe_details.id == id) {
            console.log("GETTING RECIPE FROM SESSION")
            spoon_results = req.session.recipe_details
        } else { // or else make a new API request
            console.log("SEARCHING FOR RECIPE " + id)
            spoon_results = await spoon.getRecipeDetails(id)
            req.session.recipe_details = spoon_results;
        }
        const library = await db.getRecipeLibrary(req.session.user.email);
        return res.render('recipe_details.ejs', { pageInfo: pageName, spoon_results, library, id })
    } catch (error) {
        return res.send(error)
    }

})

app.get('/recipes', requireLogin, async (req, res) => {
    const pageName = "Recipes";
    var spoon_results

    if ('recipe_query' in req.query) {
        try {
            spoon_results = await spoon.searchRecipes(req.query.recipe_query, req.query.cuisine_type)
        } catch (error) {
            return res.send(error)
        }
    }

    const library = await db.getRecipeLibrary(req.session.user.email);

    // res.send(spoon_results)
    res.render('recipes.ejs', { pageInfo: pageName,cuisineData, spoon_results, query: req.query, library })
})

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
    try {
        const library = db.getRecipeLibrary("example@example.com");
        console.log(JSON.stringify(library))
        res.render('test.ejs', {pageInfo : "Testing Page"})
    } catch (exception) {
        res.send(exception)
    }
})


app.post('/recipes/:id', (req, res) => {
    console.log("DEBUG STATEMENT:" + req.params.id)
    var recipe_id;
    if (req.body.id_add) {
        console.log("Intent: Add to library")
        req.flash('flashSuccess', "Successfully added recipe to library.")
        db.addToLibrary(req.session.user.email, parseInt(recipe_id))
    }
    else if (req.body.id_remove) {
        console.log("Intent: Remove from library")        
        req.flash('flashFail', "Successfully removed recipe removed library.")
    }
    // const recipe_id = req.body.id
    console.log(`ID: ${req.params.id}, EMAIL: ${req.session.user.email}`)
    res.redirect(req.get('referer'));
    // return res.redirect('/recipes/' + recipe_id)
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