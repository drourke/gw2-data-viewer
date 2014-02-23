'use strict';

angular.module('gw2-data-viewer.items').controller('ItemsController', [
  '$scope',
  '$routeParams',
  'Global',
  'Items',
  function ($scope, $routeParams, Global, Items) {
    $scope.global = Global;

    $scope.find = function() {
      Items.query(function(items) {
        $scope.items = items;
      });
    };

    $scope.findOne = function() {
      Items.get({
        itemId: $routeParams.itemId
      }, function(article) {
        $scope.item = item;
      });
    };
}]);