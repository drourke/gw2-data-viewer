'use strict';

angular.module('gw2-data-viewer')
  .config(['$routeProvider', 
    function($routeProvider) {
      $routeProvider
      .when('/items', {
        templateUrl: 'views/items/list.html'
      })
      .when('/', {
        templateUrl: 'views/index.html'
      }).
      otherwise({
        redirectTo: '/'
      });
    }
]);