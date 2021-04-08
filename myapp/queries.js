const Pool = require('pg').Pool
const pool = new Pool({
  user: 'kylemrosko',
  host: 'csce-315-db.engr.tamu.edu',
  database: 'db901_group11_project3',
  password: '928003182',
  port: 5432,
})

const getUsers = (request, response) => {
    console.log('in get users function')
    pool.query('SELECT * FROM demo_table', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }

  module.exports = {
    getUsers
  }