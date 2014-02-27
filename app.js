/**
 * Module dependencies.
 */
var express = require('express');
var routes  = require('./routes');
var http    = require('http');
var path    = require('path');
var request = require('request');
var url     = require('url');
var app     = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


/* 
 * GW App Routes
 */

/* Pages */
app.get('/',             routes.find_items);   /* Search form for items         */
app.get('/view_table',   routes.item_table);   /* Table view of items           */
app.get('/view_recipe',  routes.view_tree);    /* View d3js tree of item recipe */


/* JSON */
app.get('/item_details', routes.item_details); /* View json of individual item        */
app.get('/recipe_map',   routes.recipe_map);   /* View the recipe tree for item       */
app.get('/props_view',   routes.property_map); /* View map of all properties of items */

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});