# AggieEats

Configuration steps:
  - Clone repo
  - Install node with `sudo apt install node`
    - Can check if previously installed using `node -v`
  - Install node package manager (npm) with `sudo apt install npm` (optional_
    - In case library need to be added later

To run:
  - Navigate to `AggieEats`
  - Execute `node myapp/index.js`
  - Open `http://localhost:3000` in the preferred web browser


Although not functional, you can naviagte to the various pages within the website to explore. Below are a few hidden pages that demonstrate a few backend features just to show that they simply work.
  - `/users`: shows that our webapp can connect and make queries to the database hosted by TAMU by selecting all users from `demo_table`
  - `/yelp`: shows that our webapp can connect to yelp via an API call. Although results are not displayed, they are logged by node locally in the command line
