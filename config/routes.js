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
  
  //recipes.updateAll();
  //items.updateAll();
  
  // Home route
  app.get('/', recipes.discipline);

  /** Recipe Routes
   * 
   *  _____________________________________
   *  GET api/recipes?{filter}
   *
   *  Get a list of all recipes
   *
   *  _____________________________________
   *  GET api/recipes/{id}
   *  
   *  Find a recipe instance by {id}
   *  
   *  _____________________________________
   *  GET api/recipes/distinct?{field}
   *
   *  Get all the unique values associated with a given field of the recipe model.
   *
   *
   */
  app.get('/api/recipes',                       recipes.all);
  app.get('/api/recipes/:recipeId',             recipes.show);
  app.get('/api/recipes/distinct/:recipeField', recipes.show);

  /**
   * Recipe Parameters
   *
   * @param{id}     Valid recipe_id
   * @param{field}  Field to get distinct values of
   * @param{filter} Filter defining fields, where, orderBy, offset, and limit
   */
  app.param('recipeId',    recipes.recipe);
  app.param('recipeField', recipes.field);


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