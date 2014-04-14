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
  item_name: String,
  name: String,
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
    .exec(cb);
};



RecipeSchema.statics.findByItem = function(id, cb) {
  this
    .findOne({output_item_id: id})
    .select('recipe_id output_item_id')
    .exec(cb);
};

RecipeSchema.statics.groupByDiscipline = function(discipline, cb) {
  this
    .find({})
    .where('disciplines').in([discipline])
    .distinct('type')
    .exec(cb);
};

/**
 * Virtuals
 *
 * virtuals are document properties that are convenient to have 
 * around but that do not get persisted to MongoDB.
 *
 * If you need attributes that you can get and set but that are not 
 * themselves persisted to MongoDB, virtual attributes is the Mongoose 
 * feature for you.
 */
RecipeSchema.virtual.recipeDisciplines = function() {
  return this
    .distinct('type');
};

mongoose.model('Recipe', RecipeSchema);