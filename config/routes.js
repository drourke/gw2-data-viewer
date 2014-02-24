'use strict';

/**
 * This module handles the routing of requests.
 * 
 * 
 */
module.exports = function(app) {

  // Controllers
  var index   = require('../app/controllers/index');
  var items   = require('../app/controllers/items');
  var recipes = require('../app/controllers/recipes');
      
  // Home route
  app.get('/', index.render);

  /** Recipe Routes
   * 
   * Lists are returned as an array of id's
   *
   * -Get a list of recipes
   * -Get a list of craftable items
   * -Get a list of items used in crafting
   * -Get a list of recipes, filtered by crafting discipline
   *
   *
   * -Find recipe details by recipe_id
   * -Find recipe details by output_item_id
   */
  app.get('/recipes/all',              recipes.all);
  app.get('/recipes/all/items',        recipes.allItems);
  app.get('/recipes/all/ingredients',  recipes.allIngredients);

  app.get('/recipes/discipline',         recipes.discipline);
  app.get('/crafting/:discipline',       recipes.showDiscipline);
  // app.get('/crafting/:discipline/:type', recipes.showDisciplineType);

  app.get('/recipes/recipe/:recipeId', recipes.show);
  app.get('/recipes/item/:itemRecipe', recipes.show);

  /**
   * Recipe Parameters
   */
  app.param('recipeId',   recipes.recipe);
  app.param('itemRecipe', recipes.itemRecipe);
  app.param('discipline', recipes.disciplineInfo);


  /** Item Routes
   *
   * -Get list of items
   *
   * -Find an item by it item_id
   */
  app.get('items',        items.all);
  app.get('item/:itemId', items.show);

  /**
   * Item Parameters
   */
  app.param('itemId', items.item);
};