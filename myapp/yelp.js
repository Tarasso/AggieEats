const axios = require('axios').default
const db = require('./queries')

const baseUrl = 'https://api.yelp.com/v3/'
const auth = 'Bearer eYND9foowwisuxbuMvW1bUGApWxytHH3rkC2TfD0equwvbjUns0vTKiwh6ewOp6as2PWNCBv2l7AIdfxtK88BILm1yqDOIb1YKr6TlXAg9O4DSQaUISWlb8mI9lTYHYx'
const limit = 10;
const location = 'Texas A&M University';

async function searchRestaurants(query, dist=40000, offset=0) {
  if(dist != 40000)
    dist = dist*1609;
  dist = ~~dist;
  // console.log(dist)
  let ret = [];
  let res = await axios.get(baseUrl + 'businesses/search', {
      headers: {
          Authorization: auth
      },
      params: {
        term: query,
        location: location,
        limit: limit,
        radius: dist,
        offset: offset
      }
  });
  res = res.data;
  // console.log(res)
  for(i = 0; i < res.businesses.length; i++) {
    var trimmedRes = {
      "name": "",
      "url": "",
      "address": "",
      "city": "",
      "id":"",
      "price":""
    }
    trimmedRes.name = res.businesses[i].name;
    trimmedRes.url = res.businesses[i].url;
    trimmedRes.address = res.businesses[i].location.address1;
    trimmedRes.city = res.businesses[i].location.city;
    trimmedRes.id = res.businesses[i].id;
    trimmedRes.price = res.businesses[i].price;
    ret.push(trimmedRes);
    // console.log(trimmedRes.id + " " + trimmedRes.name);
    await db.storeRestaurant(trimmedRes.id, trimmedRes.name);
  }
  // console.log(ret)
  return ret;
}

async function surpriseMe(email) {
  let numPages = 0;
  while(numPages < 11) {
    let res = await searchRestaurants("", 40000, limit * numPages);

    for(i = 0; i < res.length; i++) {
      let visited = await db.restaurantVisited(email,res[i].id)
      if(!visited && (Math.random() > 0.33)) {
        console.log(res[i]);
        return res[i];
      }
   }
   numPages++;
  }
  console.log('could not find any more restaurants to reccomend')
}

module.exports = {
  searchRestaurants,
  surpriseMe
}

