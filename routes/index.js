/* Holds the item data, as well as a function
 * that is called once to load each item into the itemApi.
 * when a request is returned sortItem() is used to get the 
 * specific properties needed, and store the result in itemApi.data
 */
var itemApi = {
  config: {
    base_url  : 'https://api.guildwars2.com/v1',
    build     : '/build.json',
    cacheFile : '../gw2-data-viewer/cache/gw2_items.json',
    items: {
      store      : '../gw2-data-viewer/cache/gw2_items.json',
      id_url     : 'https://api.guildwars2.com/v1/items.json',
      detail_url : 'https://api.guildwars2.com/v1/item_details.json' 
    },
    recipes: {
      id_url     : 'https://api.guildwars2.com/v1/recipes.json',
      detail_url : 'https://api.guildwars2.com/v1/recipe_details.json'
    }
  },
  dataMap: {},
  recipeIds: {},
  load: function() {
    console.log('loading itemApi');

    var cache = this.config.cacheFile;
    var me    = this;

    this.file.load(cache, function (items) {
      for (var key in items)
          me.add(key, items[key]);

      console.log('done adding file to hashmap.');
    });
  },
  add: function(key, item) {
    this.dataMap[key] = item;
  },
  file: {
    /* Append the item/recipe JSON to the end of the file, */
    add: function(data, file) {
      var fs       = require('fs');
      var jsonData = JSON.stringify(data, null, 4);
        
      fs.writeFile(file, jsonData, function (err) {   
        if (err) 
          console.log(err);
      });
    },
      load: function(file, callback) {
        console.log('loading file...');
        var fs = require('fs');

      fs.readFile(file, function (err, data) {
        if (err) {
          console.log('error reading file.');
          console.log(err);
        }
        else {
          console.log('done loading file.');
          callback(JSON.parse(data));
        }
      });
    }
  },
  api: {
    request: function(url, params, callback) {
      var request = require('request');

      if (params !== null)
        url += params;

      request(url, function (error, response, body) {
        if (error || response.statusCode !== 200) {
          console.log('error making request');
          console.log(error);
          callback(null);
        }
        else {
          callback(JSON.parse(body));
        }
      });
    },
    getIcon: function(item) {
      var signature = item.icon_file_signature;
      var file_id   = item.icon_file_id;
      var format    = '.png';

      var render_url = 'https://render.guildwars2.com/file/' 
                     + signature 
                     + '/' 
                     + file_id 
                     + format;

      return render_url;
    }
  },
  cache: {
    update: function() {
      var compareItems,
          compareRecipes,
          doneUpdating,
          addRecipe,
          addItem;

      var item_url   = itemApi.config.items.id_url;
      var recipe_url = itemApi.config.recipes.id_url;

      var itemDetail_url   = itemApi.config.items.detail_url;
      var recipeDetail_url = itemApi.config.recipes.detail_url;

      compareItems = function(data) {
        var itemKeys     = data.items;
        var cacheKeys    = Object.keys(itemApi.dataMap);
        var missingItems = itemApi.cache.missingItems = itemKeys.length - cacheKeys.length;

        console.log('missing items:' +missingItems);

        if (itemApi.cache.missingItems > 0) {
          for (var key in itemKeys) {
            var id = itemKeys[key];

            if (itemApi.dataMap[id] === undefined) {
              console.log('item not found in cache, sending request.');
              console.log('item_id: ' +id);

              var params = '?item_id=' + id;
              itemApi.api.request(itemDetail_url, params, addItem);
            }
          }
        } 
        else {
          itemApi.cache.missingItems = 0;
        }
      };

      compareRecipes = function(data) {
        var recipeKeys     = data.recipes;
        var cacheRecipes   = Object.keys(itemApi.recipeIds);
        var missingRecipes = itemApi.cache.missingRecipes = recipeKeys.length - cacheRecipes.length;

        console.log('missing recipes:' +missingRecipes);
        if (missingRecipes > 0) {
          for (var key in recipeKeys) {
            var id = recipeKeys[key];

            if (itemApi.recipeIds[id] === undefined) {
              console.log('recipe not found in cache, sending request.');
              console.log('recipe_id: ' +id);

              var params = '?recipe_id=' +id;
              itemApi.api.request(recipeDetail_url, params, addRecipe);
            }
          }
        } 
        else {
          itemApi.cache.missingRecipes = 0;
        }
      };

      doneUpdating = function() {
        if (itemApi.cache.missingRecipes === 0 && itemApi.cache.missingItems === 0 )
          return true;
        return false;
      };

      addRecipe = function(recipe) {
        itemApi.cache.missingRecipes--;
        console.log('missing recipes left: ' +itemApi.cache.missingRecipes);

        if (recipe !== null)
          itemApi.add(recipe.output_item_id, { recipe: recipe });

        if (doneUpdating()) {
          console.log('finished syncing!');
          itemApi.file.add(itemApi.dataMap, '../datasorter/cache/gw2_items.json');
        }        
      };

      addItem = function(item) {
        itemApi.cache.missingItems--;
        console.log('missing items left: ' +itemApi.cache.missingItems);
        
        if (item !== null)
          itemApi.add(item.item_id, item);
        
        if (doneUpdating()) {
          console.log('finished syncing!');
          itemApi.file.add(itemApi.dataMap, '../datasorter/cache/gw2_items.json');
        }          
      };

      itemApi.api.request(item_url, null, compareItems);
      itemApi.api.request(recipe_url, null, compareRecipes);
    }
  }
};

(function init() {
  console.log('init');
  itemApi.load();
}());

/* Basic search form for items */
exports.find_items = function(req, res) {
  res.render('finditems');
};

/* Exports item details in JSON about a specific item, req should contain an item_id */
exports.item_details = function(req, res) {
  var item_details = getItemDetails(req);

  res.json('layout', item_details);   
};

/* exports JSON map of the recipe for a given item id */
exports.recipe_map = function(req, res) {
  console.log('getting recipe map');

  var item_details = getItemDetails(req);
  var recipe_map   = [];

  mapRecipes(item_details, recipe_map);

  res.json('layout', recipe_map[0]);
};

/* Generates a map of all properties currently in the dataMap. */
exports.property_map = function(req, res) {
  var root = itemApi.dataMap;
  var prop_map = {};

  /* Iterate through each item */ 
  for (var key in root) {
    var item = root[key];

    for (var item_key in item) {
      mapProperties(item, item_key, prop_map);
    }
  }

  res.json('layout', prop_map);
};

/* helper function to get item id from request */
function getItemDetails(req) {
  var url = require('url');
 
  var filter_item  = url.parse(req.url, true).query,
      req_id       = filter_item.item_id,
      req_details  = itemApi.dataMap[req_id]; 
  
  return req_details;  
}

/* map recipes of given item */
function mapRecipes(item, recipeNode) {

    var item_obj = {};

    /* The name and rarity of the item is added to the node */
    item_obj.name   = item.name;
    item_obj.rarity = item.rarity;

    /* 
     * Amount needed will only exist on child nodes,
     * so checks to see if the property exists
     */
    if (item.amount !== undefined)
        item_obj.amount = item.amount;

    if (item.recipe !== undefined) {

        /*
         * Create pointer to location of child node.
         * Each item in the recipe is added to the new child node.
         *
         * Using the item_id, the item details are found in the dataMap
         * These details along with the property 'amount' are passed back
         * into the function.
         */
        var itemRecipe = item.recipe.ingredients;
        var childNode  = item_obj.children = [];

        for (var key in itemRecipe) {
            var item_id = itemRecipe[key].item_id;
            var amount  = itemRecipe[key].count;
            
            /* to represent total amount of each item needed */
            if(item_obj.amount !== undefined) 
                amount *= item_obj.amount;
            

            var child_details = itemApi.dataMap[item_id];
                child_details.amount = amount;

            mapRecipes(child_details, childNode);
        }
        recipeNode.push(item_obj);
    } 
    else {
        recipeNode.push(item_obj);
    }
    return;
}

/*
 * Used to map all properties in item map.
 * 
 * Adds any properties not currently mapped to the map_node.
 * 
 * Checks if the current proprety value is either 
 * an object or an array containing objects,
 * if either are true it calls itself.
 */
function mapProperties(item, property, map_node) {
    var item = item[property]; 
    var map_node_child;

    /* 
     * Checks if the property has already been 
     * added to the map.
     */
    if (!map_node.hasOwnProperty(property)) 
        map_node[property] = {};

    /* Location of property in map */
    map_node_child = map_node[property];

    /* 
     * if the item is an array: 
     * checks if any proptery values 
     * in the array are objects.
     */
    if (Array.isArray(item)) {
        
        item.forEach(function (element, index, array) {
            if (typeof element === "object") {  
                item = element;

                for (var item_property in item) 
                    mapProperties(item, item_property, map_node_child);
            }
        });
    }
    /* If the item is an object check each property. */
    else if (typeof item === "object") {

        for (var item_property in item) 
            mapProperties(item, item_property, map_node_child);
    }
    return;
}

/* Table view of found items */
exports.item_table = function(req, res) {
    console.log('creating table');

    var url         = require('url');
    var filter_item = url.parse(req.url, true).query;

    /* 
     * Removes properties from the req.body that are not explicitly set 
     */
    for (var key in filter_item)
        if ( filter_item[key] === ''            ||
             filter_item[key] === 'All Types'   ||
             filter_item[key] === 'All Weights' ||
             filter_item[key] === 'All Rarities' 
            ) {

            delete filter_item[key];
        }

    console.log(filter_item);

    var itemMap = itemApi.dataMap;
    var matchedItems = {};

    for (var map_key in itemMap) {
        var curr_item  = itemMap[map_key];
        var matchFound = true;

        /*
         * If the item is lower than min level
         * or if it is higher than the max it is exluded
         *
         * If the property value doesnt match than it is exluded.
         */
        for (var filter_key in filter_item) {
            /* level range */
            if (filter_key === 'minLevel') {
                if (curr_item.level < filter_item[filter_key])
                    matchFound = false;
            }
            else if (filter_key === 'maxLevel') {
                if (curr_item.level > filter_item[filter_key])
                    matchFound = false;
            }
            /* checkbox is it craftable? */
            else if (filter_key === 'craftable') {
                /* if selected, check if it the item has .recipe property */
                if (filter_item[filter_key] === 'on') {
                    if (curr_item.recipe === undefined)
                        matchFound = false;
                }
            }
            /* dropdown options: type, rarity ect. */
            else if (filter_item[filter_key] !== curr_item[filter_key]) {

                matchFound = false;
            }
        }
        
        if (matchFound === true)
            matchedItems[map_key] = curr_item;
    }

    var keysFound = Object.keys(matchedItems);
    var returnList = {};

    for (var i = 0; i < 50; i++) {
        var item_id = keysFound[i];
        var item_details = itemApi.dataMap[item_id];
        returnList[item_id] = item_details;
        
    }

    res.render('itemtable', {
        'item' : returnList
    });
};

/* Recipe tree of selected item */
exports.view_tree = function(req, res) {
    var item_details = getItemDetails(req);
    var icon_url     = itemApi.api.getIcon(item_details);
    var attributes;
    var type;
    var weight;

    if (item_details.type === 'Armor') {
        attributes = item_details.armor.infix_upgrade.attributes;
        type       = item_details.armor.type;
        weight     = item_details.armor.weight_class;
    }
    else if (item_details.type === 'Weapon') {
        attributes = item_details.weapon.infix_upgrade.attributes;
        type       = item_details.weapon.type;
        weight     = null;
    }

    for (var key in attributes) {
        var attribute = attributes[key].attribute;
        var modifier  = attributes[key].modifier;

        var attrib_string = '+' + modifier + ' ' + attribute;
        attributes[key].text = attrib_string;
    }

    var tagStart    = /<c=@flavor>/gi;
    var tagEnd      = /<\/c>/gi;
    var str         = item_details.description;
    var str2        = str.replace(tagStart, '');
    var description = str2.replace(tagEnd, '');


    res.render('recipetree', {
        'item_id'  : item_details.item_id,
        
        'name'     : item_details.name,
        'icon_url' : icon_url,

        // 'defense'  : item_details.armor.defense,
        'attrib_1' : attributes[0].text,
        'attrib_2' : attributes[1].text,
        'attrib_3' : attributes[2].text,

        'type'       : type,
        'weight'     : weight,
        'level'      : item_details.level,
        'description': description
    });
};



/*
 * Exports render page for individual item,
 * Jade view = detailview.jade,
 */
exports.view_col_right = function(req, res) {
    var item_details = getItemDetails(req);
    var item         = getItemModel(item_details);

    res.render('itemdetails_col_right', item);
};

exports.view_col_left = function(req, res) {
    var item_details = getItemDetails(req);
    var item         = getItemModel(item_details);

    res.render('itemdetails_col_left', {'item': item_details});
};


function getItemModel(item_details) {
        /* base props */
    var type  = item_details.type.toLowerCase();
    var name  = item_details.name;
    var level = item_details.level;

    /* icon */
    var icon_url = itemApi.api.getIcon(item_details);

    /* description */
    var str         = item_details.description;
    var tagStart    = /<c=@flavor>/gi;
    var tagEnd      = /<\/c>/gi;
    var str2        = str.replace(tagStart, '');
    var description = str2.replace(tagEnd, '');

    /* more details */
    var sub_details;
    var sub_type;
    var attributes;
    var attribute_names = [];

    if (item_details[type] !== undefined) {
        sub_details = item_details[type];
        sub_type    = sub_details.type;
        attributes  = sub_details.infix_upgrade.attributes;
    }

    // /* Item Attributes */
    if (attributes !== undefined) {
        for (var key in attributes) {
            var modifier      = attributes[key].modifier;
            var attribute     = attributes[key].attribute;
            var attrib_string = '+' + modifier + ' ' + attribute;

            attribute_names.push(attrib_string);
        }   
    }


    /* return obj */    
    var item = {
        'name'  : name,
        'type'  : type,
        'level' : level,
        
        'sub_type'    : sub_type,
        'sub_details' : sub_details,
        
        'icon' : icon_url,
        'description' : description,
        'attributes'  : attribute_names
    };

    return item;
}


exports.craftHome = function(req, res) {
    var craftDisciplines = [
        'Armorsmith',
        'Artificer',
        'Chef',
        'Huntsman',
        'Jeweler',
        'Leatherworker',
        'Tailor',
        'Weaponsmith'
    ];

    res.send('craftHome', {craftList: craftDisciplines});

};


exports.craftInfo = function(req, res) {
    var discipline = req.params.discipline;
    var items      = itemApi.dataMap;
    var craftMap   = {};


    console.log('craftInfo');

    for (var key in items) {
        var item = items[key];
        
        if (item.recipe !== undefined) {

            var disciplines = item.recipe.disciplines;

            if (disciplines.indexOf(discipline) !== -1) {
                craftMap[key] = {
                    name   : item.name,
                    rarity : item.rarity,
                    type   : item.type,
                    level  : item.level
                };
            }
        }
    }

    res.json('layout', craftMap);
};

