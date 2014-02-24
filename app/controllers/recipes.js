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
      
      res.json('layout', {recipe_ids: recipeIds});
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





















exports.updateAll = function() {
  console.log('updating all recipes');

  var detailUrl = 'https://api.guildwars2.com/v1/recipe_details.json?recipe_id=';

  var getDetails = function(element) {

    var recipeUrl = detailUrl + element;
    console.log('getDetails');

    request(recipeUrl, function (error, response, body) {


      if (!error && response.statusCode === 200) {

        var recipeDetails = JSON.parse(body);
        var recipe = new Recipe(recipeDetails);
        recipe.save();
      }
      else {
        console.log('error');
        console.log(error);
      }
    });
  };

  request('https://api.guildwars2.com/v1/recipes.json', function (error, response, body) {
    if (!error && response.statusCode === 200) {

      var recipeIds = JSON.parse(body);
      var recipeList  = recipeIds;

      console.log(Array.isArray(recipeList));

      for (var key in recipeList) {
        recipeList[key].forEach(getDetails);
      }

    }
  });
};