'use strict';

angular.module('gw2-data-viewer', [
  'ngCookies',
  'ngResource',
  'ngRoute',

  'ui.bootstrap',
  'ui.route',

  'gw2-data-viewer.items'
]);

angular.module('gw2-data-viewer.items', []);