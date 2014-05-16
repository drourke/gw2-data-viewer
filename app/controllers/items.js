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
    base_url    : 'https://api.guildwars2.com/v1/',
    detail_url  : 'https://api.guildwars2.com/v1/item_details.json?item_id=',
    id_list_uri : 'items.json'
  },
  id_list: [],
  index: 1,

  /**
   * Used to check if the database needs to be updated.
   * Return's any recipes in the gw2 API not found in 'recipe_list'
   */
  checkItems: function(db_items) {
    this.id_list = db_items;
    
    // At a set interval send update a request to update an item.
    //setInterval(this.intervalUpdate, 60000, this);

    // Build url for req to api, include scope for any updated id's
    var me  = this;
    var url = me.config.base_url + me.config.id_list_uri;

    request(url, function (error, response, body) {

      if (!error && response.statusCode === 200) {
        console.log('Loaded item id list from official API.');

        var itemList = JSON.parse(body).items;

        // Filter current list against one from database.
        console.log('total items (API): ' + itemList.length);
        console.log('total items (DB):  ' + db_items.length);

        itemList.forEach(function (item_id) {
          if (db_items.indexOf(item_id) === -1) {
            me.id_list.push(item_id);
            me.updateItem(item_id);
          }
        });
      }
    });
  },

  /**
   * Updates the database with item details from GW API.
   */
  updateItem: function(id) {
    console.log('requesting update for item: ' +id);

    var itemUrl = this.config.detail_url + id;

    request(itemUrl, function (error, response, body) {
      if (!error && response.statusCode === 200) {

        var itemDetails = JSON.parse(body);
        var item        = new Item(itemDetails);

        console.log('Updated item: ' +item.id);
        item.save();
      }
      else {
        console.warn('Error updating item.');
        console.warn(error);
      }
    });
  },
  intervalUpdate: function(scope) {
    scope.index %= scope.id_list.length;
    var item_id  = scope.id_list[scope.index];

    scope.updateItem(item_id);
    scope.index++;
  }
};

exports.updateAll = function() {

  Item.distinct('_id', function (err, db_items) {
    if (!err) {
      console.log('Loaded item IDs from the db.');
      gwAPI.checkItems(db_items);
    }
    else {
      console.warn('Error loading item IDs from the db');
      console.warn(err);
    }
  });
};