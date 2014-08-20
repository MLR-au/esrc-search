"use strict";angular.module("searchApp",["ngCookies","ngResource","ngSanitize","ngRoute","nvd3ChartDirectives","mgcrea.ngStrap","ngAnimate"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).otherwise({redirectTo:"/"})}]),angular.module("searchApp").controller("MainCtrl",["$rootScope","$scope","$window","SolrService",function(a,b,c,d){b.select="ESRC",b.w=c.innerWidth,b.h=c.innerHeight,b.w<1024?window.location.replace("/basic-search"):b.t=165,b.padding=15,b.lpw=Math.floor(.25*(b.w-20))-b.padding,b.rpw=b.w-b.lpw-b.padding,a.$on("show-search-results-details",function(){b.detailsActive=!1}),a.$on("hide-search-results-details",function(){b.detailsActive=!0}),b.toggleDetails=function(){d.toggleDetails()}}]),angular.module("searchApp").directive("searchForm",["$rootScope","$routeParams","$timeout","SolrService",function(a,b,c,d){return{templateUrl:"views/search-form.html",restrict:"E",scope:{help:"@",deployment:"@",site:"@"},link:function(e){e.searchBox=void 0!==b.q?b.q:"*",a.$on("$locationChangeStart",function(){e.ready=d.init(e.deployment,e.site)}),e.search=function(){""===e.searchBox&&(e.searchBox="*"),d.search(e.searchBox,0,!0)},e.ready=d.init(e.deployment,e.site);var f=200*Object.keys(b).length+100;c(function(){e.search()},f)}}}]),angular.module("searchApp").factory("SolrService",["$rootScope","$http","$routeParams","LoggerService","Configuration",function a(b,c,d,e,f){function g(b,c){return e.init(f.loglevel),a.site=c,a.filters={},a.dateFilters={},a.results={},a.facets={},void 0===b&&"production"!==b&&(b="production"),void 0===c?(e.error("Can't run! No solr_core defined!"),!1):(a.solr=f[b]+"/"+c+"/select",a.deployment=b,e.debug("Solr Service: "+a.solr),e.debug("Site: "+a.site),a.dateOuterBounds(),angular.forEach(d,function(b,c){if(-1!==f.allowedRouteParams.indexOf(c)&&"q"!==c){if("object"==typeof b)for(var d=0;d<b.length;d++)a.filterQuery(c,b[d],!0);else a.filterQuery(c,b,!0);a.updateFacetCount(c)}}),!0)}function h(b){var c,d,e=a.term;c="*"===e||"~"===e.substr(-1,1)?"(name:"+e+"^20 OR altname:"+e+"^10 OR locality:"+e+"^10 OR text:"+e+")":'(name:"'+e+'"^20 OR altname:"'+e+'"^10 OR locality:"'+e+'"^10 OR text:"'+e+'")';var f=q().join(" AND ");return void 0===f&&(f=""),d=void 0===a.sort?"*"===e?"name_sort asc":"score desc":a.sort,a.resultSort=d,c={url:a.solr,params:{q:c,start:b,rows:a.rows,wt:"json","json.wrf":"JSON_CALLBACK",fq:f,sort:d}},a.q=c,a.q}function i(d,f,g){g&&(a.suggestion=void 0,b.$broadcast("search-suggestion-removed")),(d!==a.term||0===f)&&(a.results.docs=[],a.results.start=0),a.term=d;var l=h(f);e.debug(l),c.jsonp(a.solr,l).then(function(b){0===b.data.response.numFound&&0===Object.keys(a.filters).length?1===d.split(" ").length?(j(a.term),"*"!==d&&"~"!==d.substr(-1,1)&&i(d+"~",0,!1)):k(void 0):k(b)})}function j(d){var f;f={url:a.solr,params:{q:"name:"+d,rows:0,wt:"json","json.wrf":"JSON_CALLBACK"}},e.debug("Suggest: "),e.debug(f),c.jsonp(a.solr,f).then(function(c){a.suggestion=c.data.spellcheck.suggestions[1].suggestion[0],b.$broadcast("search-suggestion-available")})}function k(c){if(void 0===c)a.results={term:a.term,total:0,docs:[]};else{var d,e;if(void 0===a.results.docs)d=c.data.response.docs;else for(d=a.results.docs,e=0;e<c.data.response.docs.length;e++)d.push(c.data.response.docs[e]);for(e=0;e<d.length;e++)d[e].sequenceNo=e;a.results={term:a.term,total:c.data.response.numFound,start:parseInt(c.data.responseHeader.params.start),docs:d}}n(),v(),b.$broadcast("search-results-updated")}function l(){var b=a.results.start+a.rows;i(a.term,b)}function m(d){var f=h(0);f.params.facet=!0,f.params["facet.field"]=d,f.params.rows=0,e.debug(f),c.jsonp(a.solr,f).then(function(c){angular.forEach(c.data.facet_counts.facet_fields,function(c,d){for(var e=[],f=0;f<c.length;f+=2)e.push([c[f],c[f+1],!1]);a.facets[d]=e,b.$broadcast(d+"-facets-updated")})})}function n(){angular.forEach(a.facets,function(b,c){a.updateFacetCount(c)})}function o(b,c,d){if(void 0===a.filters[b])a.filters[b]=[c];else if(-1===a.filters[b].indexOf(c))a.filters[b].push(c);else{var e=a.filters[b].indexOf(c);a.filters[b].splice(e,1),0===a.filters[b].length&&delete a.filters[b]}d!==!0&&(a.results.docs=[],a.results.start=0,i(a.term,0,!0))}function p(b){var c,d,e;c=b,d=parseInt(b)+9,a.dateFilters[c]?delete a.dateFilters[c]:(e={from:c+"-01-01T00:00:00Z",to:d+"-12-31T23:59:59Z"},a.dateFilters[c]=e),a.results.docs=[],a.results.start=0,i(a.term,0,!0)}function q(){var b,c=[];for(b in a.filters){var d=a.filterUnion[b];c.push(b+':("'+a.filters[b].join('" '+d+' "')+'")')}var e=[];for(b in a.dateFilters){var f=a.dateFilters[b],g="(exist_to:["+f.from+" TO "+a.dateEndBoundary+"]";g+=" AND ",g+="exist_from:["+a.dateStartBoundary+" TO "+f.to+"])",e.push(g)}return c.length>0&&e.length>0?c=c.concat([e.join(" OR ")]):e.length>0&&(c=[e.join(" OR ")]),c}function r(){a.filters={},a.dateFilters={},i(a.term,0,!0),b.$broadcast("reset-all-filters")}function s(){a.hideDetails=!a.hideDetails,b.$broadcast(a.hideDetails===!0?"hide-search-results-details":"show-search-results-details")}function t(){i(a.term,0)}function u(){var b,d;b=h(0),b.params.rows=1,b.params.sort="exist_from asc",c.jsonp(a.solr,b).then(function(b){a.dateStartBoundary=b.data.response.docs[0].exist_from,d=h(0),d.params.rows=1,d.params.sort="exist_to desc",c.jsonp(a.solr,d).then(function(b){a.dateEndBoundary=b.data.response.docs[0].exist_to,a.compileDateFacets()})})}function v(){b.$broadcast("reset-date-facets");var d,e;d=h(0),d.params.rows=0,d.params.facet=!0,d.params["facet.range"]="date_from",d.params["facet.range.gap"]="+10YEARS";var f;f=a.dateStartBoundary.split("-")[0],f-=f.substr(3,1),d.params["facet.range.start"]=f+"-01-01T00:00:00Z",void 0!==a.dateEndBoundary&&(d.params["facet.range.end"]=a.dateEndBoundary,c.jsonp(a.solr,d).then(function(c){var d,e,f=c.data.facet_counts.facet_ranges.date_from.counts;for(e=[],d=0;d<f.length;d+=2)e.push([f[d].split("-")[0],f[d+1]]);a.startDateFacets=[{key:"",values:e}],b.$broadcast("start-date-facet-data-ready")})),e=h(),e.params.rows=0,e.params.facet=!0,e.params["facet.range"]="date_to",e.params["facet.range.gap"]="+10YEARS",e.params["facet.range.start"]=f+"-01-01T00:00:00Z",void 0!==a.dateEndBoundary&&(e.params["facet.range.end"]=a.dateEndBoundary,c.jsonp(a.solr,e).then(function(c){var d,e,f=c.data.facet_counts.facet_ranges.date_to.counts;for(e=[],d=0;d<f.length;d+=2)e.push([f[d].split("-")[0],f[d+1]]);a.endDateFacets=[{key:"",values:e}],b.$broadcast("end-date-facet-data-ready")}))}var a={results:{},facets:{},filters:{},filterUnion:{},dateFilters:{},term:"*",rows:10,sort:void 0,resultSort:void 0,hideDetails:!1,init:g,search:i,saveData:k,nextPage:l,updateFacetCount:m,filterQuery:o,getFilterObject:q,filterDateQuery:p,clearAllFilters:r,toggleDetails:s,reSort:t,dateOuterBounds:u,compileDateFacets:v};return a}]),angular.module("searchApp").service("LoggerService",function(){return{logLevel:"ERROR",init:function(a){this.logLevel=a},log:function(a,b){console.log(a+": ",b)},debug:function(a){"DEBUG"===this.logLevel&&this.log("DEBUG",a)},info:function(a){"INFO"===this.logLevel&&this.log("INFO",a)},error:function(a){"ERROR"===this.logLevel&&this.log("ERROR",a)}}}),angular.module("searchApp").directive("searchResults",["$rootScope","$window","SolrService",function(a,b,c){return{templateUrl:"views/search-results.html",restrict:"E",scope:{displayProvenance:"@"},link:function(b){b.showFilters=!1,b.site=c.site,b.summaryActive="",b.detailsActive="active",a.$on("search-results-updated",function(){b.results=c.results,b.filters=c.getFilterObject(),b.results.docs.length!==parseInt(b.results.total)&&(b.scrollDisabled=!1)}),a.$on("search-suggestion-available",function(){b.suggestion=c.suggestion}),a.$on("search-suggestion-removed",function(){b.suggestion=c.suggestion}),a.$on("show-search-results-details",function(){b.summaryActive="",b.detailsActive="active"}),a.$on("hide-search-results-details",function(){b.summaryActive="active",b.detailsActive=""}),b.setSuggestion=function(a){c.search(a,0,!0)},b.loadNextPage=function(){c.nextPage()},b.clearAllFilters=function(){c.clearAllFilters()}}}}]),angular.module("searchApp").directive("genericResultDisplay",["$rootScope","SolrService",function(a,b){return{templateUrl:"views/generic-result-display.html",restrict:"E",scope:{data:"=ngModel",displayProvenance:"@"},link:function(c){c.hideDetails=b.hideDetails,a.$on("hide-search-results-details",function(){c.hideDetails=!0}),a.$on("show-search-results-details",function(){c.hideDetails=!1}),c.data.url=void 0!==c.data.display_url?c.data.display_url:c.data.id}}}]),angular.module("searchApp").directive("facetWidget",["$rootScope","SolrService",function(a,b){return{templateUrl:"views/facet-widget.html",restrict:"E",scope:{facetField:"@",label:"@",join:"@"},link:function(c){b.updateFacetCount(c.facetField),void 0===c.join&&(c.join="OR"),b.filterUnion[c.facetField]=c.join,c.displayLimit=8,a.$on(c.facetField+"-facets-updated",function(){var a=b.filters[c.facetField];void 0===a?a=[]:c.isCollapsed=!0;var d,e=b.facets[c.facetField];for(d=0;d<e.length;d++)-1!==a.indexOf(e[d][0])&&(e[d][2]=!0);for(d=0;d<e.length;d++)e=0===e[d][1]&&d<c.displayLimit?e.slice(0,d):e.slice(0,c.displayLimit);c.facets=e,b.facets[c.facetField].length>c.displayLimit&&(c.moreResults=!0)}),a.$on("reset-all-filters",function(){for(var a=0;a<c.facets.length;a++)c.facets[a][2]=!1,c.selected=[]}),c.showAll=function(){c.facets=b.facets[c.facetField],c.moreResults=!1},c.facet=function(a){b.filterQuery(c.facetField,a)}}}}]),angular.module("searchApp").constant("Configuration",{production:"https://data.esrc.unimelb.edu.au/solr",testing:"https://data.esrc.info/solr",loglevel:"DEBUG",allowedRouteParams:["q","type","function"]}),angular.module("searchApp").directive("sortResults",["$rootScope","SolrService",function(a,b){return{templateUrl:"views/sort-results.html",restrict:"E",link:function(c){c.sortBy=b.resultSort,a.$on("search-results-updated",function(){c.sortBy=b.resultSort}),c.sort=function(){b.sort=c.sortBy,b.reSort()}}}}]),angular.module("searchApp").directive("dateRangeGraph",["$rootScope","$window","SolrService",function(a,b,c){return{templateUrl:"views/date-range-graph.html",restrict:"E",link:function(b){b.startDateBoundary=void 0,b.endDateBoundary=void 0,a.$on("start-date-facet-data-ready",function(){b.dateFacets=c.startDateFacets})}}}]),angular.module("searchApp").directive("dateFacetWidget",["$rootScope","SolrService",function(a,b){return{templateUrl:"views/date-facet-widget.html",restrict:"E",link:function(c){c.facets={},c.selected=[],a.$on("reset-date-facets",function(){c.facets={}}),a.$on("start-date-facet-data-ready",function(){var a=b.startDateFacets[0].values;d(a),e()}),a.$on("end-date-facet-data-ready",function(){var a=b.endDateFacets[0].values;d(a),e()}),a.$on("reset-all-filters",function(){c.selected=[],e()});var d=function(a){for(var b=0;b<a.length;b++){var d=parseInt(a[b][0]),e=parseInt(a[b][0])+10,f=parseInt(a[b][0])+9,g={start:d,end:e,label:d+" - "+f};c.facets[a[b][0]]=g}},e=function(){for(var a in c.facets)c.facets[a].checked=-1!==c.selected.indexOf(parseInt(a))?!0:!1};c.facet=function(a){b.filterDateQuery(a),-1===c.selected.indexOf(a)?c.selected.push(a):c.selected.splice(c.selected.indexOf(a),1)}}}}]),angular.module("searchApp").filter("dateFilterPrettifier",function(){return function(a){var b=a.replace(/-01-01T/g,"").replace(/-12-31T/g,"");return b=b.replace(/00:00:00Z/g,"").replace(/23:59:59Z/g,""),console.log(b),b}}),angular.module("searchApp").directive("provenanceView",function(){return{templateUrl:"views/provenance-view.html",restrict:"E",scope:{data:"=",displayProvenance:"@"},link:function(){}}});