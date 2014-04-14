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
      res.json(itemIds);
    }
  });
};

/**
 * Helper functions to manage updating the database with any
 * changes from the official GW API
 */
 var gwAPI = {
  config: {
    items_url  : 'https://api.guildwars2.com/v1/items.json',
    detail_url : 'https://api.guildwars2.com/v1/item_details.json?item_id='
  },
  /**
   * Used to check if the database needs to be updated.
   * Return's any recipes in the gw2 API not found in 'recipe_list'
   */
  checkItems: function(db_items) {
    var me = this;
    console.log('check item_db for updates');
    request(me.config.items_url, function (error, response, body) {

      if (!error && response.statusCode === 200) {
        var itemIDs  = JSON.parse(body);
        var itemList = itemIDs.items;

        // Filter current list against one from database.
        itemList.forEach(function (item_id) {
          if (db_items.indexOf(item_id) === -1) {
            me.updateItem(item_id);
          }
        });
      }
    });
  },
  /**
   * Updates the database with item details from GW API.
   */
  updateItem: function(item_id) {
    var itemUrl = this.config.detail_url + item_id;

    request(itemUrl, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var itemDetails = JSON.parse(body);
        var item        = new Item(itemDetails);

        console.log('saving item: ' +item.item_id);
        item.save();
      }
      else {
        console.log('error');
        console.log(error);
      }
    });
  }
};

exports.updateAll = function() {
  Item.find({}, function (err, db_items) {
    if (!err) {
      db_items = db_items.map(function (item) {
        return item.item_id;
      });
      gwAPI.checkItems(db_items);
    }
  });
};