const Pool = require('pg').Pool
const pool = new Pool({
  user: 'kylemrosko@aggieeats',
  host: 'aggieeats.postgres.database.azure.com',
  database: 'aggieEatsDb',
  password: 'WeLoveCSCE315',
  port: 5432,
})

// ---------------------------- USERS ------------------------------------------------

const getUsers = (request, response) => {
    pool.query('SELECT "firstName", "lastName" FROM users')
        .then(res => console.table(res.rows))
        .catch(e => console.error(e.stack))
  }

async function getUser(email) {
  const res = await pool.query('SELECT * FROM users where "email" = $1', [email])
  return res.rows[0]
}

async function getUserId(email) {
  const res = await getUser(email);
  return res["userId"]
}

async function getUniqueUserId() {
  try {
    const res = await pool.query('select max("userId") from users')
    return res.rows[0]["max"] + 1;
  } catch (err) {
    console.log(err.stack)
  }
}

async function userExists(email) {
  const res = await pool.query('SELECT * FROM users where "email" = $1', [email])
  if(res.rows[0] != null) {
    return true
  } else {
    return false
  }
}

async function createNewUser(email, firstName, lastName, password) {
  const userId = await getUniqueUserId();
  const points = 0;
  const values = [userId, email, firstName, lastName, password, points];
  let res = await pool.query('INSERT INTO users VALUES ($1, $2, $3, $4, $5, $6)', values);
  console.log('Successfully created new user')
}

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

async function recipeExists(id) {
  const res = await pool.query('SELECT * FROM recipes where "id" = $1', [id])
  if(res.rows[0] != null) {
    return true
  } else {
    return false
  }
}

async function storeRecipe(id, title) {
  const values = [id, title];
  let exists = await recipeExists(id);
  if(!exists) {
    let res = await pool.query('INSERT INTO recipes VALUES ($1, $2)', values);
    console.log('Successfully created new')
  }
  
}

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

async function getRecipeLibrary(email) {
  let names = [];
  let res = await pool.query('select "recipe_lib" from users where "email" = $1',[email]);
  recipes = res.rows[0]["recipe_lib"];
  for(i = 0; i < recipes.length; i++) {
    let name = await getRecipeTitle(recipes[i]);
    names.push(name);
  }
  return names;
}

// -----------------------------------------------------------------------------------

// -------------------------- Leaderboard --------------------------------------------

async function getTopUsers(limit, email="") {
  let ret = [];
  let res = await pool.query('select "email", "firstName", "lastName", "points" from users order by "points" DESC');
  let users = res.rows;
  let selfIncluded = false;
  for(i = 0; i < limit; i++) {
    users[i].rank = i + 1;
    delete users[i]["email"];
    ret.push(users[i]);
    if(users[i]["email"] == email)
      selfIncluded = true;
  }
  if(email === "")
    return ret;
  // below is extra
  let val = limit;
  while(!selfIncluded && val < users.length) {
    if(users[val]["email"] == email) {
      users[val].rank = val + 1;
      delete users[val]["email"];
      ret.push(users[val]);
      selfIncluded = true;
    }
    val += 1;
  }
  return ret;

}

// -----------------------------------------------------------------------------------

// -------------------------- Restaurants --------------------------------------------

async function getUniqueReviewId() {
  try {
    const res = await pool.query('select max("reviewId") from reviews')
    return res.rows[0]["max"] + 1;
  } catch (err) {
    console.log(err.stack)
  }
}

async function getAverageRating(resturantId) {
  let res = await pool.query('select avg("rating")::numeric(10,1) from reviews where "restaurantId" = $1',[resturantId]);
  if(res.rows[0]["avg"] == null)
    return "No reviews yet!"
  else
    return res.rows[0]["avg"];
}

async function getRecentReview(resturantId) {
  let res = await pool.query('select * from reviews where "restaurantId" = $1 order by "reviewId" DESC limit 1',[resturantId]);
  if(res.rows.length === 0)
    return "No reviews yet!"
  else
    return res.rows[0];
}

async function leaveReview(email, rating, review, restaurantId, shareOnTwitter) {
  let reviewId = await getUniqueReviewId();
  let userId = await getUserId(email);
  const values = [reviewId, rating, review, restaurantId, userId]
  let res = await pool.query('INSERT INTO reviews VALUES ($1, $2, $3, $4, $5)', values);
  // TODO: create funtion for twitter stuff
}

// -----------------------------------------------------------------------------------

// -------------------------- Stats --------------------------------------------

async function getTotalRestaurants(email) {
  let res = await pool.query('select "res_history" from users where "email" = $1',[email]);
  if(res.rows[0]["res_history"] != null)
    return res.rows[0]["res_history"].length;
  else
    return 0;
}

async function getTotalRecipes(email) {
  let res = await pool.query('select "recipe_lib" from users where "email" = $1',[email]);
  if(res.rows[0]["recipe_lib"] != null)
    return res.rows[0]["recipe_lib"].length;
  else
    return 0;
}

async function getAverageUserRating(email) {
  let userId = await getUserId(email);
  let res = await pool.query('select avg("rating")::numeric(10,1) from reviews where "userId" = $1',[userId]);
  if(res.rows[0]["avg"] == null)
    return "No reviews yet!"
  else
    return res.rows[0]["avg"];
 
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
    getAverageUserRating
  }
