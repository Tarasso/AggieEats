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
      "price":"",
      "recentReview": "",
      "averageRating": ""
    }
    trimmedRes.name = res.businesses[i].name;
    trimmedRes.url = res.businesses[i].url;
    trimmedRes.address = res.businesses[i].location.address1;
    trimmedRes.city = res.businesses[i].location.city;
    trimmedRes.id = res.businesses[i].id;
    trimmedRes.price = res.businesses[i].price;
    trimmedRes.recentReview = await db.getRecentReview(trimmedRes.id);
    trimmedRes.averageRating = await db.getAverageRating(trimmedRes.id);
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
      if(!visited && (Math.random() > 0.50)) {
        // console.log(res[i]);
        return [res[i]];
      }
   }
   numPages++;
  }
  console.log('could not find any more restaurants to reccomend')
}

const baseURL2 = " https://api.twitter.com/1.1/search/tweets.json?q=%40EatsAggie&src=typed_query"
const consumer_key ='WjOFFJJNNlqQAy0OLUDbBkdPP'
const consumer_secret_key ='SsnVzQixTdLkrF69lObiJq18xZ4RAvIJ2dr7eUe1Bxi0PifMzx'
const access_token ='1381342691435364352-s8fRUfXeWA6OvMyXvmZEkxpvbEA8XV'
const access_token_secret ='k3fIJjjKftvR3bCHFhRdJWLOP7D3yLWjOns9cEUYTa0M9'

var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: consumer_key,
  consumer_secret: consumer_secret_key,
  access_token_key: access_token,
  access_token_secret: access_token_secret
});

async function searchtweets() {
  res = [];
  client.get('search/tweets', {q: '@EatsAggie'}, function(error, tweets, response) {
    
    for(i=0; i<tweets.statuses.length; i++){
      res.push(tweets.statuses[i].id_str);
    }
    console.log(res);

    for(j=0;j<res.length;j++){
      client.post('statuses/retweet/' + res[j], function(errors, tweet, responses) {
        for (i=0; i<res.length; i++){
          if(!errors){
            console.log(tweet);
            }
        }
      });
     } 
 });

 
}

async function retweeting(){
var tweetId = '';

}

module.exports = {
  searchRestaurants,
  surpriseMe,
  retweeting, 
  searchtweets
}

