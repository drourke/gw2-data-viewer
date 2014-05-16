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
 * Find all the recipes matched by filter
 */
exports.all = function(req, res) {
  console.log('find all recipe ids');

  var filter  = req.query.filter;
  var where   = {};
  var options = {};

  for (var key in filter) {
    if (key === 'where') {

      var param = filter[key];

      for (var p_key in param) {
        where[p_key] = param[p_key];
      }
    }
    else {
      options[key] = filter[key];
    }
  }

  var query = Recipe.find(where, null, options);

  query.exec(function (err, recipes) {
    if (err) {
      console.warn('Error querying recipes');
      console.warn(err);
    }
    else {
      console.log('Success');
      console.log('Found: ' +recipes.length+ ' results.');
      res.jsonp(recipes);
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
