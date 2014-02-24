'use strict';

/**
 * Module dependencies.
 */
var should   = require('should');
var mongoose = require('mongoose');
var Recipe   = mongoose.model('Recipe');
var Item     = mongoose.model('Item');

//Globals
var recipe, item, item2;

//The tests
describe('<Unit Test>', function() {
  describe('Model Recipe:', function() {

    before(function(done) {

      item = new Item({
        item_id: '19797',
        name: 'Alpine Harpoonthrower',
        description: '',
        type: 'Weapon',
        level: '80',
        rarity: 'Exotic',
        vendor_value: '396',
        icon_file_id: '534288',
        icon_file_signature: 'B144EAD21C1A0A030A79B6A3D5050BFB34C97BFB',
        game_types: [
          'Pvp',
          'PvpLobby'
        ],
        flags: [
          'NoSell',
          'SoulbindOnAcquire',
          'SoulBindOnUse'
        ],
        restrictions: [],
        weapon: {
          type: 'Speargun',
          damage_type: 'Physical',
          min_power: '905',
          max_power: '1000',
          defense: '0',
          infusion_slots: [],
          suffix_item_id: ''
        }
      });

      item2 = new Item({
        item_id: '13094',
        name: 'Alpine Harpoonthrower',
        description: '',
        type: 'Weapon',
        level: '80',
        rarity: 'Exotic',
        vendor_value: '396',
        icon_file_id: '534288',
        icon_file_signature: 'B144EAD21C1A0A030A79B6A3D5050BFB34C97BFB',
        game_types: [
          'Pvp',
          'PvpLobby'
        ],
        flags: [
          'NoSell',
          'SoulbindOnAcquire',
          'SoulBindOnUse'
        ],
        restrictions: [],
        weapon: {
          type: 'Speargun',
          damage_type: 'Physical',
          min_power: '905',
          max_power: '1000',
          defense: '0',
          infusion_slots: [],
          suffix_item_id: ''
        }
      });

      recipe = new Recipe({
        recipe_id: '1275',
        type: 'Coat',
        output_item_id: '19797',
        output_item_count: '1',
        min_rating: '25',
        time_to_craft_ms: '1000',
        disciplines: [ 'Leatherworker' ],
        flags: [],
        ingredients: [{
            item_id: '19797',
            count: '1',
          },{
            item_id: '13094',
            count: '1',
          }]
        });

      item.save();
      item2.save();
      done();
    });

    describe('Method Save', function() {
      
      it('should begin with no recipes', function(done) {
        Recipe.find({}, function(err, recipes) {
          recipes.should.have.length(0);
          done();
        });
      });

      it('should be able to save without problems', function(done) {
        return recipe.save(function(err) {
          should.not.exist(err);
          done();
        });
      });
    });

    after(function(done) {
      Item.remove().exec();
      Recipe.remove().exec();
      done();
    });
  });
});