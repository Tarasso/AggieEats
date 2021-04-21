const axios = require('axios').default

const baseUrl = 'https://api.yelp.com/v3/'
const auth = 'Bearer eYND9foowwisuxbuMvW1bUGApWxytHH3rkC2TfD0equwvbjUns0vTKiwh6ewOp6as2PWNCBv2l7AIdfxtK88BILm1yqDOIb1YKr6TlXAg9O4DSQaUISWlb8mI9lTYHYx'

function toMiles(meters) {
    return (meters)/1609;
  }
  const dist = toMiles(3000);
  const limit = 3;
// async function searchRestaurant(cuisine, item, distance = 10000)
// {
// }

function resolveAfter2Seconds() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('resolved');
      }, 2000);
    });
  }
async function testRestaurant()
{
  console.log('calling');
  const result = await resolveAfter2Seconds();
  console.log(result);
    

    try{
    var trimmedRes = {
        "name": "",
        "url": "",
        "address": "",
        "city": ""
    }
    let res = await axios.get(baseUrl + 'businesses/search', {
        headers: {
            Authorization: auth
        },
        params: {
          term: 'thai food',
          location: 'Texas A&M University',
          limit: limit,
          radius: dist
        }
    });
    res = res.data;
    trimmedRes.name = res.businesses[0].name;
    trimmedRes.url = res.businesses[0].url;
    trimmedRes.address = res.businesses[0].location.address1;
    trimmedRes.city = res.businesses[0].location.city;
    console.log(trimmedRes)
    }
    catch{throw new Error('Failed');}
}

module.exports = {
    testRestaurant
    // searchRestaurant
}

