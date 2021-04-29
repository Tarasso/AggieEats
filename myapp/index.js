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
const { abort } = require('process');
const app = express()
const port = process.env.PORT || 3000


// path.join(...) is to make directories relative to index.js rather
// than relative to terminal directory

// load up public CSS/JS files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// load up views
app.set('views', path.join(__dirname, '/views'))

// hook up EJS for dynamic HTML
app.set('view engine', 'ejs');

// route views
app.get('/yelp', (req, res) => {
    res.send('Yelp API testing page!');
    yelp.searchRestaurants('thai food', 1.5);
    // spoon.searchRecipes("pasta","greek")
    // spoon.getRecipeDetails(654939)

});

app.get('/test', (req, res) => {
    res.send('Welcome to the testing page!');
    // db.storeRecipe('S37tD90W3dQJw6r0Ir7-9g','555 Grill');

    //yelp.surpriseMe("lc@test.com");
    yelp.searchtweets();
    //yelp.retweeting();
    // db.editReview(23,1,"suck");
    db.getRestaurantHistory("lc@test.com")

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
    res.render('home.ejs', { pageName, topUsers })

})

app.get('/dashboard', requireLogin, async (req, res) => {
    const pageName = "Dashboard";
    const topUsers = await db.getTopUsers(10, req.session.user.email);
    const library = await db.getRecipeLibrary(req.session.user.email);
    const diningHistory = await db.getRestaurantHistory(req.session.user.email);
    const totalRestaurants = await db.getTotalRestaurants(req.session.user.email);
    const totalRecipes = await db.getTotalRecipes(req.session.user.email);
    const averageRatings = await db.getAverageUserRating(req.session.user.email);
    const totalPoints = await db.getTotalPoints(req.session.user.email);
    var stats = { totalRestaurants: totalRestaurants, totalRecipes: totalRecipes, averageRatings: averageRatings, totalPoints: totalPoints }
    console.log("Dining History" + JSON.stringify(diningHistory))
    res.render('dashboard.ejs', { pageName, topUsers, library, stats, diningHistory })
})

// restaurants main page
app.get('/restaurants', requireLogin, async (req, res) => {
    const pageName = "Restaurants";
    var yelp_results; // will be object that has a list of objects containing restaurant info

    if (req.query.surprise_me) { // if surprise me button pressed, get surprise me results
        yelp_results = await yelp.surpriseMe(req.session.user.email)
    }
    else if (req.query.foodName) { // otherwise, if search button pressed...
        const distance = (req.query.distance == undefined) ? (25) : req.query.distance // obtain distance if specified (or default to 25)
        yelp_results = await yelp.searchRestaurants(req.query.foodName, distance) // and then get query results
    }
    res.render('restaurants.ejs', { pageName, yelp_results }) // render page
})


app.get('/testing', async (req, res) => {
    try {
        const library = db.getRecipeLibrary("example@example.com");
        console.log(JSON.stringify(library))
        res.render('test.ejs', { pageInfo: "Testing Page" })
    } catch (exception) {
        res.send(exception)
    }
})

// restaurant details view page
app.get('/restaurants/:id', requireLogin, async (req, res) => {
    const id = req.params.id
    console.log("viewing review: '" + id + "'")
    const pageName = "Review Details";
    var restaurant_name;
    //var review_list;
    try {
        restaurant_name = await db.getRestaurantTitle(id)
        const past_review = await db.getUserReviewFromRestauraunt(req.session.user.email, id)
        //review_list = await db.getRecentReview(req.params.id)
        res.render('review_details.ejs', { pageName, restaurant_name, id, past_review })
    } catch (error) {
        res.send(error)
    }
})

// restaurant details post review
app.post('/restaurants/:id', async (req, res) => {
    const ratingReceieved = req.body.rating
    const reviewReceived = req.body.review
    const reviewID = req.body.reviewID
    const id = req.params.id
    console.log(req.body)
    if (ratingReceieved == 0) {
        req.flash('flashFail', 'Please select a rating from 1 to 5 stars.')
    } else {
        if (reviewID != -1) {
            req.flash('flashSuccess', `Successfully modified your review.`)
            await db.editReview(reviewID, ratingReceieved, reviewReceived)
        } else {
            req.flash('flashSuccess', `Successfully rated this restaurant a ${ratingReceieved}!`)
            await db.leaveReview(req.session.user.email, ratingReceieved, reviewReceived, id)
        }
    }
    res.redirect('/restaurants/' + id)

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
        return res.render('recipe_details.ejs', { pageName, spoon_results, library, id })
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
    res.render('recipes.ejs', { pageName, cuisineData, spoon_results, query: req.query, library })
})

app.get('/login', (req, res) => {
    const pageName = "Login";
    res.render('login.ejs', { pageName })
})

app.get('/logout', async (req, res) => {
    if (!req.session.user) {
        res.redirect('/')
        return;
    }
    req.session.destroy();
    const pageName = "Logged out";
    res.locals.userAccount = null
    res.render('logout.ejs', { pageName })
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
    res.render('register.ejs', { pageName })
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





app.post('/recipes/:id', async (req, res) => {
    console.log("DEBUG STATEMENT:" + req.params.id)
    var recipe_id = req.params.id;
    if (req.body.id_add) {
        console.log("Intent: Add to library")
        req.flash('flashSuccess', "Successfully added recipe to library.")
        await db.addToLibrary(req.session.user.email, parseInt(recipe_id))
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

app.post('/dashboard/recipes', async (req, res) => {
    console.log("ID:" + req.body.id)
    await db.removeFromLibrary(req.session.user.email, parseInt(req.body.id))
    res.status(204).send()
})

// For any undefined pages, handle here
app.get('*', (req, res) => {
    const pageName = "Unknown";
    res.render('unknown.ejs', { pageName })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})


// This app starts a server and listens on port 3000 for connections.
// For every other path, it will respond with a 404 Not Found.