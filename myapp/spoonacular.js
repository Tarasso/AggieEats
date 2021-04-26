const axios = require('axios').default
const db = require('./queries')

const recipeEndpoint = 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/'
const apiKey = '3f2a47789fmsh47927bebe5c0b3fp1903efjsn21bdca7b70aa'
const host = 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'
// const apiKey = 'a6440d2c86ae4fb689e96a76d7783c90'
// const apiKey = '92c516f2fb3a4db99c07e6901bcfd3bf' // this is ammar's
// const apiKey = '3abcc91390874fbf9263b2b911b22431' // this is kyle's
const limit = 12

async function searchRecipes(terms, cuisine = "") {
  let res = await axios.get(recipeEndpoint + 'complexSearch', {
      params: {
        apiKey: apiKey,
        query: terms,
        number: limit,
        cuisine: cuisine
      },
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': host
      }
    });
  for(i = 0; i < res.data.results.length; i++) {
    console.log(res.data.results[i].id,res.data.results[i].title);
    db.storeRecipe(res.data.results[i].id,res.data.results[i].title);
  }
  return res.data;
}

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
    let res = await axios.get(recipeEndpoint + id + '/information', {
        params: {
          apiKey: apiKey
        },
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': host
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