'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

/**
 * Recipe Schema
 */
var RecipeSchema = new Schema({
  _id: {
    type: Number
  },
  recipe_id: {
    type: Number,
    unique   : true,
    index    : true,
    required : true
  },
  type: {
    type: String
  },
  output_item_id: {
    index : true,
    type  : Number,
    ref   : 'Item'
  },
  min_rating        : Number,
  vendor_value      : Number,
  time_to_craft_ms  : String,
  output_item_count : Number,
  disciplines       : Array,
  flags             : Array,
  ingredients: [{
    item_id: {
      type : Number,
      ref  : 'Item'
    },
    count: Number
  }]
});

/**
 * Middleware
 */
RecipeSchema.pre('save', function(next) {
  this._id = this.recipe_id;

  next();
});

/**
 * Returns the recipe document associated with _id and
 * populates the name for the item produced
 */
RecipeSchema.statics.load = function(id, cb) {
  this
    .findOne({recipe_id: id})
    .populate({
      path   : 'output_item_id',
      select : 'name -_id'
    })
    .exec(cb);
};

RecipeSchema.statics.getDistinct = function(field, cb) {
  this
    .find({})
    .distinct(field)
    .exec(cb);
};

mongoose.model('Recipe', RecipeSchema);