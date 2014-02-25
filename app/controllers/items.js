'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Item     = mongoose.model('Item');

/**
 * Find an item by id
 */
exports.item = function(req, res, next, id) {
  
  Item.load(id, function (err, item) {
    if (err) next(err);
    if (!item) next(new Error ('Failed to load item ' +id));

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
      res.render('error', {
        status: 500
      });
    }
    else {
      var itemIds = items.map(function (item) {
        return item.item_id;
      });
      res.json(items: itemIds);
    }
  });
};