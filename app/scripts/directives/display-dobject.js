'use strict';

angular.module('searchApp')
  .directive('displayDobject', function () {
    return {
      templateUrl: 'views/display-dobject.html',
      restrict: 'E',
      scope: {
          data: '=ngModel'
      },
      link: function postLink(scope, element, attrs) {
      }
    };
  });
