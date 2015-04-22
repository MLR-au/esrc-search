'use strict';

angular.module('searchApp')
  .directive('smoothzoom', [ '$window', '$timeout', function ($window, $timeout) {
    return {
      template: '',
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
          scope.init = function() {
              element.smoothZoom({
                  animation_SPEED_PAN: 0.5,
                  zoom_MAX: 200,
                  background_COLOR: 'transparent',
                  border_TRANSPARENCY: 0,
                  button_ALIGN: 'top right',
                  button_AUTO_HIDE: true,
                  button_SIZE: 26,
                  responsive: true
              });
          }

          scope.$watch('image_pane_height', function() {
              element.smoothZoom('destroy');
              scope.init();
          })

          element.on('load', function() {
              scope.init();
          });
      }
    };
  }]);
