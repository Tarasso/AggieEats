const axios = require('axios').default

function getTodos()
{
    axios({
        method: 'get',
        url: 'https://api.yelp.com/v3/businesses/search',
        headers: {
            Authorization: 'Bearer eYND9foowwisuxbuMvW1bUGApWxytHH3rkC2TfD0equwvbjUns0vTKiwh6ewOp6as2PWNCBv2l7AIdfxtK88BILm1yqDOIb1YKr6TlXAg9O4DSQaUISWlb8mI9lTYHYx'
        },
        params: {
          term: 'thai food',
          location: 'College Station Texas',
          limit: 3
        }
    })
        .then(res => console.log(res.data))
        .catch(err => console.error(err));
}

module.exports = {
    getTodos
}