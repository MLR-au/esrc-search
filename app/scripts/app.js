'use strict';

angular.module('searchApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'nvd3ChartDirectives',
  'mgcrea.ngStrap',
  'ngAnimate'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        reloadOnSearch: false
      })
      .when('/:site', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        reloadOnSearch: false
      })
      .when('/view/:imageid', {
        templateUrl: 'views/image-view.html',
        controller: 'ImageViewCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
