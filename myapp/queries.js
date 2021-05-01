const tweets = require('./tweets')

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'kylemrosko@aggieeats',
  host: 'aggieeats.postgres.database.azure.com',
  database: 'aggieEatsDb',
  password: 'WeLoveCSCE315',
  port: 5432,
})

// ---------------------------- USERS ------------------------------------------------

// returns the user entry in db based on email
async function getUser(email) {
  const res = await pool.query('SELECT * FROM users where "email" = $1', [email])
  return res.rows[0]
}

// returns the user id from user email
async function getUserId(email) {
  const res = await getUser(email);
  return res["userId"]
}

// return the next unqiue id to assign to new user
async function getUniqueUserId() {
  try {
    const res = await pool.query('select max("userId") from users')
    return res.rows[0]["max"] + 1;
  } catch (err) {
    console.log(err.stack)
  }
}

// returns true or false if a user exists
async function userExists(email) {
  const res = await pool.query('SELECT * FROM users where "email" = $1', [email])
  if(res.rows[0] != null) {
    return true
  } else {
    return false
  }
}

// given the registration information, creates a new user in the db
async function createNewUser(email, firstName, lastName, password) {
  const userId = await getUniqueUserId();
  const points = 0;
  const values = [userId, email, firstName, lastName, password, points];
  let res = await pool.query('INSERT INTO users VALUES ($1, $2, $3, $4, $5, $6)', values);
  console.log('Successfully created new user')
}

// checks if user inputs valid email and password
async function login(req) {
  let email = req.email;
  let password = req.password;
  let exists = await userExists(email)
  if(exists) {
    let user = await getUser(email)
    if(password == user.password) {
      return user
    }
    else { return null }
  }
  else { console.log("no accouts associated with that email")}
}

// wrapper function for createNewUser()
// ensures that a given email is not already in use
async function requestNewAccount(req) {
  let email = req.email;
  let password = req.password;
  let firstName = req.firstName;
  let lastName = req.lastName;
  let exists = await userExists(email)
  if(exists) {
    console.log("there is already an account associated with this email")
    return null
  }
  else {
    console.log("creating new account");
    await createNewUser(email, firstName, lastName, password);
    let res = await getUser(email);
    return res;
  }
}

// -----------------------------------------------------------------------------------

// ---------------------------- RECIPES ----------------------------------------------

// checks if a recipe is already in the db
async function recipeExists(id) {
  const res = await pool.query('SELECT * FROM recipes where "id" = $1', [id])
  if(res.rows[0] != null) {
    return true
  } else {
    return false
  }
}

// stores a new recipe into the db
async function storeRecipe(id, title) {
  const values = [id, title];
  let exists = await recipeExists(id);
  if(!exists) {
    let res = await pool.query('INSERT INTO recipes VALUES ($1, $2)', values);
    console.log('Successfully created new')
  }
  else {
    console.log('recipe already in db')
  }
  
}

// returns a recipe title given a recipe id
async function getRecipeTitle(id) {
  const values = [id];
  const res = await pool.query('SELECT * FROM recipes where "id" = $1', values);
  if(res.rows[0] != null) {
    return res.rows[0]["title"];
  } else {
    console.log('recipe not in db')
    return null;
  }
}

// adds recipe to user library and updates user's points
async function addToLibrary(email, recipeId) {
  const values = [recipeId, email];
  let userLib = await getUser(email);
  userLib = userLib.recipe_lib;
  if(userLib != null && userLib.includes(recipeId))
    console.log("already in library");
  else {
    console.log("need to add");
    let res = await pool.query('update users set "recipe_lib" = array_append(recipe_lib,$1) where "email" = $2',values);
    console.log('updated lib');
    // add points to user account 
    pool.query('UPDATE users SET points = points + 1 WHERE "email" = $1',[email])
  }
}

// removes recipe from user library
async function removeFromLibrary(email, recipeId) {
  const values = [recipeId, email];
  let userLib = await getUser(email);
  userLib = userLib.recipe_lib;
  if(userLib != null && !userLib.includes(recipeId))
    console.log("cannot remove bc recipe does not exist in library");
  else {
    console.log("need to remove");
    let res = await pool.query('update users set "recipe_lib" = array_remove(recipe_lib,$1) where "email" = $2',values);
    console.log('updated lib');
    // add points to user account 
    pool.query('UPDATE users SET points = points - 1 WHERE "email" = $1',[email])
  }
}

// returns all recipes in a user's recipe library
async function getRecipeLibrary(email) {
  let items = [];
  let res = await pool.query('select "recipe_lib" from users where "email" = $1',[email]);
  recipes = res.rows[0]["recipe_lib"];
  if (recipes == null) {
    return null
  }
  for(i = 0; i < recipes.length; i++) {
    let name = await getRecipeTitle(recipes[i]);
    let temp = {
      "id": "",
      "name": ""
    };
    temp.id = recipes[i];
    temp.name = name;
    items.push(temp);
  }
  console.log(items);
  return items;
}

// -----------------------------------------------------------------------------------

// -------------------------- Leaderboard --------------------------------------------

// returns the top users on the website
// if given an email, it will also show where you stand in comparison to the top users
async function getTopUsers(limit, email="") {
  let ret = [];
  let res = await pool.query('select "email", "firstName", "lastName", "points" from users order by "points" DESC');
  let users = res.rows;
  let selfIncluded = false;
  for(i = 0; i < limit; i++) {
    if(i >= users.length)
      continue;
    users[i].rank = i + 1;
    ret.push(users[i]);
    if(users[i]["email"] == email)
      selfIncluded = true;
  }
  if(email === "") {
    console.log("no email provided for leaderboard")
    return ret;
  }
  // below is extra
  let val = limit;
  while(!selfIncluded && val < users.length) {
    if(users[val]["email"] == email) {
      users[val].rank = val + 1;
      ret.push(users[val]);
      selfIncluded = true;
    }
    val += 1;
  }
  return ret;

}

// -----------------------------------------------------------------------------------

// -------------------------- Restaurants --------------------------------------------

// checks if a resutrant is currently in the db
async function RestaurantExists(id) {
  const res = await pool.query('SELECT * FROM restaurants where "id" = $1', [id])
  if(res.rows[0] != null) {
    return true
  } 
  else {
    return false
  }
}

// checks if a user has visited a given resturant
async function restaurantVisited(email, id) {
  let userHist = await getUser(email);
  userHist = userHist.res_history;
  if(userHist != null && userHist.includes(id))
    return true;
  else
    return false;
}

// stores restaurant in the db
async function storeRestaurant(id, name) {
  const values = [name, id];
  let exists = await RestaurantExists(id);
  if(!exists) {
    let res = await pool.query('INSERT INTO restaurants VALUES ($1, $2)', values);
  }
}

// returns restaurant title given an id
async function getRestaurantTitle(id) {
  const values = [id];
  const res = await pool.query('SELECT * FROM restaurants where "id" = $1', values);
  if(res.rows[0] != null) {
    return res.rows[0]["name"];
  } else {
    console.log('restaurant not in db')
    return null;
  }
}

// adds resturant to a users resturant history
async function addToRestaurantHistory(email, restaurantId) {
  const values = [restaurantId, email];
  let userLib = await getUser(email);
  userLib = userLib.res_history;
  if(userLib != null && userLib.includes(restaurantId))
    console.log("already in history");
  else {
    console.log("need to add");
    let res = await pool.query('update users set "res_history" = array_append(res_history,$1) where "email" = $2',values);
    console.log('updated lib');
    // add points to user account 
    pool.query('UPDATE users SET points = points + 1 WHERE "email" = $1',[email])
  }
}

// returns the restaurant history for a user
async function getRestaurantHistory(email) {
  let vals = [];
  let res = await pool.query('select "res_history" from users where "email" = $1',[email]);
  rest = res.rows[0]["res_history"];
  if(rest == null)
    return null;
  for(i = 0; i < rest.length; i++) {
    let temp = {
      "id": "",
      "name": "",
      "rating": "",
      "review": ""
    }
    temp.id = rest[i];
    temp.name = await getRestaurantTitle(rest[i]);
    let rev = await getUserReviewFromRestauraunt(email, rest[i]);
    temp.rating = rev["rating"];
    temp.review = rev["review"];
    vals.push(temp);
  }
  console.log(vals);
  return vals;
}

// generates the next unique review id
async function getUniqueReviewId() {
  try {
    const res = await pool.query('select max("reviewId") from reviews')
    return res.rows[0]["max"] + 1;
  } catch (err) {
    console.log(err.stack)
  }
}

// calculates the average rating for a restaurant
async function getAverageRating(resturantId) {
  let res = await pool.query('select avg("rating")::numeric(10,1) from reviews where "restaurantId" = $1',[resturantId]);
  if(res.rows[0]["avg"] == null)
    return "No reviews yet!"
  else
    return res.rows[0]["avg"];
}


// returns the most revent review for a restaurant
async function getRecentReview(resturantId) {
  let res = await pool.query('select * from reviews where "restaurantId" = $1 order by "reviewId" DESC limit 1',[resturantId]);
  if(res.rows.length === 0)
    return "No reviews yet!"
  else
    return res.rows[0]["review"];
}

// updates review db with a new review
async function leaveReview(email, rating, review, restaurantId) {
  let reviewId = await getUniqueReviewId();
  let userId = await getUserId(email);
  const values = [reviewId, rating, review, userId, restaurantId]
  let res = await pool.query('INSERT INTO reviews VALUES ($1, $2, $3, $4, $5)', values);
  console.log(`'${email}' left a review of '${rating}' with message '${review}' for restaurant ${restaurantId}`)
  await addToRestaurantHistory(email, restaurantId);
  tweets.searchtweets();
}

// returns a users own review for a restaurant
async function getUserReviewFromRestauraunt(email, resturantId) {
  let userId = await getUserId(email);
  const values = [userId, resturantId];
  let res = await pool.query('select * from reviews where "userId" = $1 and "restaurantId" = $2', values);
  return res.rows[0];

}

// updates a users preexisiting review
async function editReview(reviewId, newRating, newReview) {
  const values = [newRating, newReview, reviewId];
  let res = await pool.query('update reviews set "rating" = $1, "review" = $2 where "reviewId" = $3', values);
  console.log("updated review")
}

// increments user's twitter count and gives them a point
async function twitterButton(email) {
  let res = await getUser(email);
  if(res["tweets"] == null)
    pool.query('UPDATE users SET tweets = 1 WHERE "email" = $1',[email]);
  else
    pool.query('UPDATE users SET tweets = tweets + 1 WHERE "email" = $1',[email]);

  pool.query('UPDATE users SET points = points + 1 WHERE "email" = $1',[email])
}

// -----------------------------------------------------------------------------------

// -------------------------- Stats --------------------------------------------

// returns the total amount of restaurants a user has visited
async function getTotalRestaurants(email) {
  let res = await pool.query('select "res_history" from users where "email" = $1',[email]);
  if(res.rows[0]["res_history"] != null)
    return res.rows[0]["res_history"].length;
  else
    return 0;
}

// returns the total number of recipes saved by user
async function getTotalRecipes(email) {
  let res = await pool.query('select "recipe_lib" from users where "email" = $1',[email]);
  if(res.rows[0]["recipe_lib"] != null)
    return res.rows[0]["recipe_lib"].length;
  else
    return 0;
}

// computes an average of all ratings given by a user
async function getAverageUserRating(email) {
  let userId = await getUserId(email);
  let res = await pool.query('select avg("rating")::numeric(10,1) from reviews where "userId" = $1',[userId]);
  if(res.rows[0]["avg"] == null)
    return "No reviews yet!"
  else
    return res.rows[0]["avg"];
 
}

// returns a users total points
async function getTotalPoints(email) {
  let res = await pool.query('select "points" from users where "email" = $1',[email]);
  return res.rows[0]["points"];
}

// returns a users number of tweets
async function getNumberOfTweets(email) {
  let res = await pool.query('select "tweets" from users where "email" = $1',[email]);
  return res.rows[0]["tweets"];
}

// -----------------------------------------------------------------------------------
  module.exports = {
    login,
    storeRecipe,
    getRecipeTitle,
    requestNewAccount,
    getTopUsers,
    addToLibrary,
    getRecipeLibrary,
    leaveReview,
    getRecentReview,
    getAverageRating,
    getTotalRestaurants,
    getTotalRecipes,
    getAverageUserRating, 
    getRestaurantTitle,
    getRestaurantHistory,
    storeRestaurant,
    addToRestaurantHistory,
    removeFromLibrary,
    RestaurantExists,
    restaurantVisited,
    getUserReviewFromRestauraunt,
    editReview,
    getTotalPoints,
    twitterButton,
    getNumberOfTweets
  }
