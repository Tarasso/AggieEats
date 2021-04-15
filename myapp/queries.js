const Pool = require('pg').Pool
const pool = new Pool({
  user: 'kylemrosko@aggieeats',
  host: 'aggieeats.postgres.database.azure.com',
  database: 'aggieEatsDb',
  password: 'WeLoveCSCE315',
  port: 5432,
})

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

const createNewUser = async (request, response) => {
  const userId = await getUniqueUserId();
  const email = "example@example.com";
  const firstName = "Kyle";
  const lastName = "Mrosko";
  const password = "pass";
  const points = 0;
  const values = [userId, email, firstName, lastName, password, points];
  pool.query('INSERT INTO users VALUES ($1, $2, $3, $4, $5, $6)', values)
      .then(console.log('Successfully created new'))
      .catch(e => console.error(e.stack))
}

async function login(req) {
  let email = req.email;
  let password = req.password;
  let exists = await userExists(email) 
  if(exists) {
    let user = await getUser(email)
    if(password == user.password) {
      return true
    } else {
      return false
    }
  }
}

  module.exports = {
    login
  }