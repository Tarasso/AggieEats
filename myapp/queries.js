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

function storeRecipe(id, title) {
  const values = [id, title];
  pool.query('INSERT INTO recipes VALUES ($1, $2)', values)
      .then(console.log('Successfully created new'))
      .catch(e => console.error(e.stack))
}

async function getRecipeTitle(id) {
  const values = [id];
  const res = await pool.query('SELECT * FROM recipes where "id" = $1', values);
  if(res.rows[0] != null) {
    console.log(res.rows[0]["title"]) // return this
  } else {
    console.log('recipe not in db')
  }
}

// -----------------------------------------------------------------------------------

  module.exports = {
    login,
    storeRecipe,
    getRecipeTitle,
    requestNewAccount
  }
