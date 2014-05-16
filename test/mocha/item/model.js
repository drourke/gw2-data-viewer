'use strict';

/**
 * Module dependencies.
 */
var should   = require('should');
var	mongoose = require('mongoose');
var	Item     = mongoose.model('Item');

//Globals
var item;

//The tests
describe('<Unit Test>', function() {
	describe('Model Item:', function() {

		before(function(done) {
			item = new Item({
				item_id: '31230',
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
			done();
		});

		describe('Method Save', function() {
			
			it('should begin with no items', function(done) {
				Item.find({}, function(err, items) {
					items.should.have.length(0);
					done();
				});
			});

			it('should be able to save without problems', function(done) {
				return item.save(function(err) {
					should.not.exist(err);
					done();
				});
			});

			it('should be able to show an error when try to save without name', function(done) {
				item.name = '';

				return item.save(function(err) {
					should.exist(err);
					done();
				});
			});
		});

		after(function(done) {
			Item.remove().exec();
			done();
		});
	});
});