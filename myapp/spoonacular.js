const axios = require('axios').default
const db = require('./queries')

const recipeEndpoint = 'https://api.spoonacular.com/recipes/'
const apiKey = 'a6440d2c86ae4fb689e96a76d7783c90'
// const apiKey = '92c516f2fb3a4db99c07e6901bcfd3bf' // this is ammar's
// const apiKey = '3abcc91390874fbf9263b2b911b22431' // this is kyle's
const limit = 12

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
  for(i = 0; i < res.data.results.length; i++) {
    console.log(res.data.results[i].id,res.data.results[i].title);
    db.storeRecipe(res.data.results[i].id,res.data.results[i].title);
  }
  return res.data;
}

// ****************************************************************
// Idea:
// display all info in trimmedRes in pop up box
// ****************************************************************
async function getRecipeDetails(id) {


    let trimmedRes = {
        "id": "",
        "title": "",
        "time": 0,
        "servings": 0,
        "url": "",
        "image": "",
        "vegan": "",
        "vegetarian": "",
        "glutenFree": "",
        "dairyFree": ""


    };
    let res = await axios.get(recipeEndpoint + '/' + id + '/information', {
        params: {
          apiKey: apiKey
        }
      });
    trimmedRes.id = res.data.id;
    trimmedRes.title = res.data.title;
    trimmedRes.time = res.data.readyInMinutes;
    trimmedRes.url = res.data.sourceUrl;
    trimmedRes.image = res.data.image;
    trimmedRes.servings = res.data.servings;
    trimmedRes.vegan = res.data.vegan;
    trimmedRes.vegetarian = res.data.vegetarian;
    trimmedRes.glutenFree = res.data.glutenFree;
    trimmedRes.dairyFree = res.data.dairyFree;

    return trimmedRes;
}

module.exports = {
    searchRecipes,
    getRecipeDetails
}