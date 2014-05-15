'use strict';

/** 
 * @ngdoc directive
 * @name facet-widget
 * @restrict E
 * @scope 
 * @description
 *  A UI control for a SOLR facet. Displays the available content as a set
 *  of checkboxes that can be added to the query as filters.
 * 
 * @param {string} facetField - The field for which to get the facet counts
 * @param {string} label - The name to be used for the widget
 *
 */
angular.module('searchApp')
  .directive('facetWidget', [ 'SolrService', function (SolrService) {
    return {
        templateUrl: 'views/facet-widget.html',
        restrict: 'E',
        scope: {
            facetField: '@',
            label: '@'
        },
        link: function postLink(scope, element, attrs) {
            scope.isCollapsed = true;

            SolrService.getFacet(scope.facetField).then(function(d) {
                var facets = d.data.facet_counts.facet_fields[scope.facetField];
                scope.facets = [];
                var f = [];
                for (var i = 0; i < facets.length; i += 2) {
                    f.push(facets[i]);
                }
                scope.facets = f.sort();
           });
        
            scope.facet = function(facet) {
                SolrService.facet(scope.facetField, facet);
                for (var i = 0; i < scope.facets.length; i++) {
                    if (scope.facets[i][0] === facet) {
                        scope.facets[i][2] = true;
                    }
                }
            }

      }
    };
  }]);