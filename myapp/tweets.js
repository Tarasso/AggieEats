const baseURL2 = " https://api.twitter.com/1.1/search/tweets.json?q=%40AggieEatsBot&src=typed_query"
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
  client.get('search/tweets', {q: '@AggieEatsBot'}, function(error, tweets, response) {
    
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

module.exports = { 
    searchtweets
  }
  