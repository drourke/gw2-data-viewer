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
    recipes_url : 'https://api.guildwars2.com/v1/recipes.json',
    detail_url  : 'https://api.guildwars2.com/v1/recipe_details.json?recipe_id='
  },
  /**
   * Used to check if the database needs to be updated.
   * Return's any recipes in the gw2 API not found in 'recipe_list'
   */
  checkRecipes: function(db_recipes) {
    var me = this;

    request(me.config.recipes_url, function (error, response, body) {

      if (!error && response.statusCode === 200) {
        var recipeIds  = JSON.parse(body);
        var recipeList = recipeIds.recipes;

        // Filter current list against one from database.
        recipeList.forEach(function (recipe_id) {
          if (db_recipes.indexOf(recipe_id) === -1) {
            me.updateRecipe(recipe_id);
          }
        });
      }
    });
  },
  /**
   * Updates the database with recipe details from GW API.
   */
  updateRecipe: function(recipe_id) {
    var recipeUrl = this.config.detail_url + recipe_id;

    request(recipeUrl, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var recipeDetails = JSON.parse(body);
        var recipe        = new Recipe(recipeDetails);

        console.log('saving recipe: ' +recipe.recipe_id);
        recipe.save();
      }
      else {
        console.log('error');
        console.log(error);
      }
    });
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