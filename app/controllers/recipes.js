'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var request  = require('request');
var Recipe   = mongoose.model('Recipe');

/**
 * Find a recipe by recipe_id
 */
exports.recipe = function(req, res, next, id) {
  console.log('get recipe_id: ' +id);

  Recipe.load(id, function (err, recipe) {

    if (err) return next(err);
    if(!recipe) return next(new Error ('Failed to load recipe ' + id));

    req.recipe = recipe;
    next();
  });
};

/**
 * Find all the distinct values of a field in the recipe collection.
 */
exports.field = function(req, res, next, field) {
  console.log('get distinct: ' +field);

  Recipe.distinct(field, function (err, field_list) {

    if (err) return next(err);
    if(!field_list) return next(new Error ('Failed to load field_list ' + field));

    req.recipe        = {};
    req.recipe[field] = field_list;

    next();
  });
};

/** 
 * Exports an array of all recipes 
 */


// var alt_test = querystring.parse('filter%5Bwhere%5D%5Bcity%5D=Scottsdale');
// var conv_back = querystring.stringify(alt_test);
/**
 * GET /crafting/{recipe_id}
 *
 * GET /crafting?filter[distinct]={field}

   e.g. GET /crafting?filter[distinct]={discipline}
 * Return all the unique values of the field discipline
 *
 * GET /crafting?filter[where][discipline]={discipline}
 * Return all the recipes with a discipline = {discipline}
 * 
 * JSON: { filter: 
 *           { where: { discipline: 'discipline' }}
         }
 *

 * GET /crafting?filter[where][discipline]={discipline}&filter[distinct]={type}
 * Return all the distinct types of recipe for a discipline
 *
 */


 // qs.parse('user[name][first]=Tobi&user[email]=tobi@learnboost.com');
// => { user: { name: { first: 'Tobi' }, email: 'tobi@learnboost.com' } }

// qs.stringify({ user: { name: 'Tobi', email: 'tobi@learnboost.com' }})
// => user[name]=Tobi&user[email]=tobi%40learnboost.com


exports.all = function(req, res) {
  console.log('find all recipe ids');
  console.log('filters: ');
  console.log(req.params);
  console.log(req.query);
  
  Recipe.find({}, { 'recipe_id' : 1 }, function (err, recipes) {
    if (err) {
      console.log(err);
    }
    else {
      var recipeIds = recipes.map(function (recipe) {
        return recipe.recipe_id;
      });

      res.json('layout', {recipes: recipeIds});
    }
  });
};

/**
 * Show a recipe
 */
exports.show = function(req, res) {
  res.jsonp(req.recipe);
};



/** Aggregation pipeline for item crafting
 *
 * This method will go through the stored recipes and return an array of crafting disciplines, 
 * with the list of categories associted with each discipline.
 *
 * $project gets fields that will be used for structuring response.
 * 
 * $unwind produces one output document per 'discipline'
 * 
 * $Group groups together recipes by their crafting discipline.
 *    $addToSet is used on the 'type' property to 
 *    get the list of categories used in each 
 *    crafting discipline.
 *
 * $project is used to rename the properties to make them clearer, and to remove the _id.
 *     'type' = categories, 
 *     'disciplines' = discipline
 */
exports.discipline = function(req, res) {

  Recipe.aggregate({
      $project: {
        disciplines : 1,
        type        : 1
      }
    },{
      $unwind: '$disciplines'
    },{
      $group: {
        _id: {
          disciplines : '$disciplines'
        },
        type: {
          $addToSet: '$type'
        }
      }
    },{
      $project: {
        _id        : 0,
        discipline : '$_id.disciplines',
        categories : '$type'
      }
    },
    function (err, disciplines) {
      if (err) {
        console.log(err);
      }
      else {
        res.render('index', {
          'disciplines': disciplines
        });
      }
    }
  );
};




/**
 * Helper functions to manage updating the database with any
 * changes from the official GW API
 */
var gwAPI = {
  config: {
    base_url    : 'https://api.guildwars2.com/v1/',
    details_uri : 'recipe_details.json?recipe_id=',
    id_list_uri : 'recipes.json',
  },
  id_list: [],
  index: 1,

  /**
   * Used to check if the database needs to be updated.
   * Return's any recipes in the gw2 API not found in 'recipe_list'
   */
  checkRecipes: function(db_recipes) {
    this.id_list = db_recipes;

    // At a set interval send update a request to update a recipe.
    //setInterval(this.intervalUpdate, 60000, this);

    // Build url for req to api, include scope for any updated id's
    var me  = this;
    var url = me.config.base_url + me.config.id_list_uri;
    
    request(url, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log('Loaded recipe id list from official API.');
        
        var recipeList = JSON.parse(body).recipes;

        // Filter current list against one from database.
        console.log('total recipes (API): ' + recipeList.length);
        console.log('total recipes (DB):  ' + db_recipes.length);

        recipeList.forEach(function (recipe_id) {
          if (db_recipes.indexOf(recipe_id) === -1) {
            me.id_list.push(recipe_id);
            me.updateRecipe(recipe_id);
          }
        });
      }
      else {
        console.warn(error);
      }
    });
  },

  /**
   * Updates the database with recipe details from GW API.
   */
  updateRecipe: function(id) {
    console.log('requesting update for recipe: ' +id);

    var url = this.config.base_url + this.config.details_uri + id;
    
    request(url, function (error, response, body) {
      if (!error && response.statusCode === 200) {

        var recipeDetails = JSON.parse(body);
        var recipe        = new Recipe(recipeDetails);

        console.log('Updated recipe: ' +recipeDetails.recipe_id);
        recipe.save();
      }
      else {
        console.warn('Error updating recipe.');
        console.warn(error);
      }
    });
  },
  intervalUpdate: function(scope) {
    scope.index  %= scope.id_list.length;
    var recipe_id = scope.id_list[scope.index];

    scope.updateRecipe(recipe_id);
    scope.index++;
  }
};


exports.updateAll = function() {
  console.log('updating all recipes');

  Recipe.distinct('_id', function (err, db_recipes) {
    if (!err) {
      console.log('Loaded recipe IDs from the db.');

      gwAPI.checkRecipes(db_recipes);
    }
    else {
      console.warn('Error loading recipe IDs from the db');
      console.warn(err);
    }
  });
};
