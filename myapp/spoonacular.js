const axios = require('axios').default

const recipeEndpoint = 'https://api.spoonacular.com/recipes/'
const apiKey = '3abcc91390874fbf9263b2b911b22431'
const limit = 9

// support diets later
// search term requied, cuisine optional
// ****************************************************************
// Idea:
// display title and image
// clicking on "more details" calls getRecipeDetails with recipe id
// ****************************************************************
async function searchRecipes(terms, cuisine = "") {
    let res = await axios.get(recipeEndpoint + 'complexSearch', {
        params: {
          apiKey: apiKey,
          query: terms,
          number: limit,
          cuisine: cuisine
        }
      });
    return res.data;
}

// ****************************************************************
// Idea:
// display all info in trimmedRes in pop up box
// ****************************************************************
async function getRecipeDetails(id) {
    let trimmedRes = {
        "title": "",
        "time": 0,
        "servings": 0,
        "url": "",
        "image": ""

    };
    let res = await axios.get(recipeEndpoint + '/' + id + '/information', {
        params: {
          apiKey: apiKey
        }
      });
    trimmedRes.title = res.data.title;
    trimmedRes.time = res.data.readyInMinutes;
    trimmedRes.url = res.data.sourceUrl;
    trimmedRes.image = res.data.image;
    trimmedRes.servings = res.data.servings;
    console.log(trimmedRes);
    return trimmedRes;
}

module.exports = {
    searchRecipes,
    getRecipeDetails
}