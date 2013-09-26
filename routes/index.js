// Object for managing GuildWars2 API Data
var gw2Data = {
  
  worldNames : {},
  mapNames   : {},
  eventNames : {},

  //Adds API data to gw2Data obj
  loadData: function(db) {
    var me = this;

    db.worldNames(function (data) {
      me.worldNames = data;
    });

    db.mapNames(function (data) {
      me.mapNames = data;
    });

    db.eventNames(function (data) {
      me.eventNames = data;
    });
  }
};


exports.gw2list = function (db) {
  gw2Data.loadData(db);

  return function (req, res) {
    res.render('gw2list', {
        'title'      : 'GW2 API',
        'worldNames' : gw2Data.worldNames,
        'mapNames'   : gw2Data.mapNames,
        'eventNames' : gw2Data.eventNames
    });
  };
};