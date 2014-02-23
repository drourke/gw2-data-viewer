'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var request  = require('request');
var Item     = mongoose.model('Item');

/**
 * Find an item by id
 */
exports.item = function(req, res, next, id) {
  console.log('find item: ' +id);
  Item.load(id, function (err, item) {

    if (err)
      next(err);

    if (!item)
      next(new Error ('Failed to load item ' +id));

    req.item = item;

    next();
  });
};

/*
 * Send json of item details.
 */
exports.show = function(req, res) {
  res.json('layout', req.item);
};


/** 
 * Exports an array of all item ids 
 */
exports.all = function(req, res) {

  Item.find({}, { 'item_id' : 1 }, function (err, items) {

    if (err) {
      console.log(err);
    }
    else {
      var itemIds = items.map(function (item) {
        return item.item_id;
      });

      res.json('layout', itemIds);
    }
  });
};

// exports.itemRecipe = function(req, res) {
//   console.log('get item recipe');
//   var item_id = req.param('id');

//   var hasRecipe = function(element) {
//     console.log(element);
//
//     Recipe
//       .findOne({'output_item_id': element.item_id})
//       .select({
//         'recipe_id': 1, 
//         'output_item_id': 1, 
//         'ingredients': 1,
//         'type' : 1,
//         'disciplines': 1
//       })
//       // .populate('output_item_id', 'name')
//       .exec(function (err, recipe) {
//         if (err || recipe === null)
//           return element;
//         else {
//           console.log(recipe);
//           console.log('it has a recipe!');
//           var ingredients = recipe.ingredients.map(hasRecipe);
//           return ingredients;
//         }
//       });
//   }

//   Recipe.load(item_id, function(err, recipe) {
    
//   });
  // Recipe
  //   .findOne({'output_item_id': item_id})
  //   .select({
  //     'recipe_id': 1, 
  //     'output_item_id': 1, 
  //     'ingredients': 1,
  //     'type' : 1,
  //     'disciplines': 1
  //   })
  //   .populate('output_item_id', 'name')
  //   // .populate('ingredients.item_id', 'name')
  //   .exec(function (err, recipe) {
  //     if (err) {
  //       console.log(err);
  //       res.json('layout', 'item has no recipe!');
  //     }
  //     else {
  //       console.log('the item name is', recipe.output_item_id.name);
        
  //       recipe.ingredients = recipe.ingredients.map(hasRecipe);

  //       res.json(recipe);
  //     }
  //   });
// };






