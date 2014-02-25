'use strict';

angular.module('gw2-data-viewer.items')
  .factory('Items', ['$resource', function($resource) {
    return $resource('items/:itemId', {
      itemId: '@_id'
    });
}]);