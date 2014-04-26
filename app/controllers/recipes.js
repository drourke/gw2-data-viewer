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

  Recipe.load(id, function (err, recipe) {

    if (err) return next(err);
    if(!recipe) return next(new Error ('Failed to load recipe ' + id));

    req.recipe = recipe;
    next();
  });
};

/**
 * Find a recipe by item_id
 */
exports.itemRecipe = function(req, res, next, id) {

  Recipe.findByItem(id, function (err, recipe) {

    if (err)return next(err);
    if(!recipe)return next(new Error ('Failed to load recipe ' + id));

    req.recipe = recipe;

    next();
  });
};


/**
 * Aggregation methods
 */
exports.disciplineInfo = function(req, res, next, discipline) {

  Recipe.groupByDiscipline(discipline, function (err, categories) {

    if (err) return next(err);
    if(!categories) return next(new Error ('Failed to load discipline ' + discipline));

    req.categories = categories;
    req.discipline = discipline;

    next();
  });
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
 * Exports an array of all recipes 
 */
exports.all = function(req, res) {
  console.log('find all recipe ids');

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
 * Exports an array of all craftable items
 */
exports.allItems = function(req, res) {

  Recipe.distinct('output_item_id', {}, function (err, items) {
    if (err)
      res.render('error', {
        status: 500
      });
    else
      res.json('layout', {craftable_items: items});
  });
};

/**
 * Exports an array of all items which 
 * are used as ingredients in crafting
 */
exports.allIngredients = function(req, res) {

  Recipe.distinct('ingredients.item_id', {}, function (err, items) {
    if (err)
      res.render('error', {
        status: 500
      });
    else
      res.json('layout', {crafting_items: items});
  });
};


/**
 * Show a recipe
 */
exports.show = function(req, res) {
  res.json('layout', req.recipe);
};

exports.showDiscipline = function(req, res) {
  res.render('categories', {
    'discipline': req.discipline,
    'categories': req.categories
  });
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
    var me = this;
    me.id_list = db_recipes;
    console.log('ddd');
    // Each minute send update a request to update a recipe.
    setInterval(this.intervalUpdate, 60000, this);

    var url = me.config.base_url + me.config.id_list_uri;
    request(url, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var recipeList = JSON.parse(body).recipes;

        // Filter current list against one from database.
        recipeList.forEach(function (recipe_id) {
          if (db_recipes.indexOf(recipe_id) === -1) 
            me.id_list.push(recipe_id);
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
    var url = this.config.base_url + this.config.details_uri + id;

    request(url, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var recipeDetails = JSON.parse(body);

        var recipe = new Recipe(recipeDetails);
            recipe.save();

        console.log('Updated recipe: ' +recipeDetails.recipe_id);
      }
      else {
        console.warn(error);
      }
    });
  },
  intervalUpdate: function(scope) {
      scope.index %= scope.id_list.length;
      var recipe_id = scope.id_list[scope.index];

      console.log('requesting update for recipe: ' +recipe_id);

      scope.updateRecipe(recipe_id);
      scope.index++;
    }
};

exports.updateAll = function() {
  Recipe.find({}, function (err, db_recipes) {
    if (!err) {
      db_recipes = db_recipes.map(function (recipe) {
        return recipe.recipe_id;
      });
      gwAPI.checkRecipes(db_recipes);
    }
  });
};
