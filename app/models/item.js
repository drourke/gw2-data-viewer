'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;


/**
 * Item Schema
 * 
 * This collection single field 'item_id' as the index (primary key).
 * item_id is guaranteed to be unique, and is used by the official api
 * for querying item details.
 * 
 * Relationships which are one-to-many are represented 
 * by an array e.g. infusion_slot: [...];
 * 
 * all other relationships are one-to-one.
 *
 * http://wiki.guildwars2.com/wiki/API/item_details
 */

var ItemSchema = new Schema({
    item_id: {
      type: Number,
      unique   : true,
      index    : true,
      required : true
    },
    name: {
      type     : String,
      required : true
    },
    type: {
      type     : String,
      required : true
    },
    level        : Number,
    description  : String,
    rarity       : String,

    vendor_value        : Number,
    icon_file_id        : Number,
    icon_file_signature : String,

    game_types   : Array,
    flags        : Array,
    restrictions : Array,
    armor: {
      type          : {type: String},
      weight_class  : String,
      defense       : Number,

      infusion_slots: [{
        flags : Array,
        item  : String
      }],
      infix_upgrade: {
        buff: {
          skill_id    : String,
          description : String
        },
        attributes: [{
          attribute : String,
          modifier  : String
        }]
      },
      suffix_item_id: Number
    },
    consumable: {
      type: {type: String},
      duration_ms : Number,
      description : String,
      unlock_type : String,
      recipe_id   : Number,
      color_id    : String
    },
    trinket: {
      type: {type: String},
      infusion_slots: [{
        flags : Array,
        item  : String
      }],
      infix_upgrade: {
        buff: {
          skill_id    : String,
          description : String
        },
        attributes: [{
          attribute : String,
          modifier  : String
        }]
      },
      suffix_item_id: Number
    },
    upgrade_component: {
      type                   : {type: String},
      flags                  : Array,
      infusion_upgrade_flags : Array,
      bonuses                : String,
      suffix                 : String,
      infix_upgrade: {
        buff: {
          skill_id    : String,
          description : String
        },
        attributes: [{
          attribute : String,
          modifier  : String
        }]
      }
    },
    weapon: {
      type           : {type: String},
      damage_type    : String,
      min_power      : Number,
      max_power      : Number,
      defense        : Number,
      suffix_item_id : String,
      infusion_slots: [{
        flags : Array,
        item  : String
      }],
      infix_upgrade: {
        buff: {
          skill_id    : String,
          description : String
        },
        attributes: [{
          attribute : String,
          modifier  : String
        }]
      }
    },
    back: {
      infusion_slots: [{
        flags : Array,
        item  : String
      }],
      infix_upgrade: {
        buff: {
          skill_id    : String,
          description : String
        },
        attributes: [{
          attribute : String,
          modifier  : String
        }]
      },
      suffix_item_id: Number
    },
    bag: {
      size: Number,
      no_sell_or_sort : Boolean
    },
    tool: {
      type    : {type: String},
      charges : Number
    },
    container: {
      type: {type: String}
    },
    gizmo: {
      type: {type: String}
    },
    gathering: {
      type: {type: String}
    }
  }
);


/**
 * Middleware
 */
ItemSchema.pre('save', function(next) {
  this._id = this.item_id;

  next();
});

ItemSchema.post('init', function(item) {
  if (process.env.NODE_ENV === 'development')
    console.log('%s has been initialized from the db', item._id);
});

/**
 * Find an item by it's _id
 */
ItemSchema.statics.load = function(id, cb) {
  this
    .findById(id)
    .exec(cb);
};

/**
 * Find the distinct values of a property
 */
ItemSchema.statics.findDistinctValues = function(prop, cb) {
  this
    .distinct(prop)
    .exec(cb);
};

/**
 * Aggregates all items associated with a set of properties and values.
 *
 * Params should be the prop and value to match by, e.g.
 * param: { type: 'Armor' }
 */
ItemSchema.statics.aggregateByPropValues = function(params, cb) {
  this
    .aggregate({$match: params})
    .exec(cb);
};



/**
 * Virtuals
 */
ItemSchema.virtual.itemTypes = function() {
  return this.distinct('type');
};


/**
 * Validations
 */
ItemSchema.path('name').validate(function(name) {
  return name.length;
}, 'Item must have a name');


mongoose.model('Item', ItemSchema);


exports.updateAll = function() {
  var Item     = mongoose.model('Item');
  var request = require('request');
  console.log('updating all items');

  var detailUrl = 'https://api.guildwars2.com/v1/item_details.json?item_id=';

  var getDetails = function(itemId) {
    var itemUrl = detailUrl + itemId;

    request(itemUrl, function (error, response, body) {


      if (!error && response.statusCode === 200) {
        var item = new Item(JSON.parse(body));

        item.update();
      } else {
        console.log('error');
        console.log(error);
      }
    });
  };

  request('https://api.guildwars2.com/v1/items.json', function (error, response, body) {
    if (!error && response.statusCode === 200) {

      var itemList = JSON.parse(body);

      for (var key in itemList) {
        if (itemList.hasOwnProperty(key))
          itemList[key].forEach(getDetails);
      }

      console.log('finished updating items');
    }
  });
};