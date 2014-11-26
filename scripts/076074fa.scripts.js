"use strict";angular.module("searchApp",["ngCookies","ngSanitize","ngRoute","ngAnimate"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl",reloadOnSearch:!1}).when("/view",{templateUrl:"views/image-view.html",controller:"ImageViewCtrl"}).when("/:site",{templateUrl:"views/main.html",controller:"MainCtrl",reloadOnSearch:!1}).otherwise({redirectTo:"/"})}]),angular.module("searchApp").controller("MainCtrl",["$rootScope","$scope","$window","$location","SolrService",function(a,b,c,d,e){var f=angular.element(c);f.bind("resize",function(){b.$apply(function(){g()})});var g=function(){b.w=c.innerWidth,b.h=c.innerHeight,b.w<760||(b.t=230),b.w<1024?(b.lpw=Math.floor(.35*b.w)-1,b.rpw=b.w-b.lpw-1):(b.lpw=Math.floor(.25*b.w)-1,b.rpw=b.w-b.lpw-1)};g(),b.$on("show-search-results-details",function(){b.detailsActive=!1}),b.$on("hide-search-results-details",function(){b.detailsActive=!0}),b.$on("site-name-retrieved",function(){"ESRC"===e.site?(b.site_name="Search the datasets.",b.site_url=d.absUrl(),b.returnToSiteLink=!1):(b.site_name="Search: "+e.site_name,b.site_url=e.site_url,b.returnToSiteLink=!0)}),b.toggleDetails=function(){e.toggleDetails()},b.clearAllFilters=function(){e.clearAllFilters()},b.openAllFilters=function(){a.$broadcast("open-all-filters")},b.closeAllFilters=function(){a.$broadcast("close-all-filters")}}]),angular.module("searchApp").controller("ImageViewCtrl",["$scope","ImageService",function(a,b){var c=b.get();"OHRM"===c.data_type?a.single=!0:a.set=!0}]),angular.module("searchApp").directive("searchForm",["$routeParams","$location","SolrService",function(a,b,c){return{templateUrl:"views/search-form.html",restrict:"E",scope:{help:"@",searchType:"@"},link:function(d){d.$on("app-ready",function(){d.searchBox=c.term,d.setSearchType(c.searchType!==d.searchType?c.searchType:d.searchType),c.rows!==c.defaultRows&&(c.rows=c.defaultRows)}),d.setSearchBox=function(){if(void 0!==a.q)if(angular.isArray(a.q)){var c=b.search();d.searchBox=a.q[0],b.search("q",c.q[0])}else d.searchBox=a.q;else d.searchBox="*"},d.search=function(){""===d.searchBox&&(d.searchBox="*"),c.search(d.searchBox,0,!0)},d.setSearchType=function(a){c.searchType=a,"phrase"===c.searchType?(d.keywordSearch=!1,d.phraseSearch=!0):(d.phraseSearch=!1,d.keywordSearch=!0),d.search()},d.setSearchBox(),d.ready=c.init()}}}]),angular.module("searchApp").factory("SolrService",["$rootScope","$http","$routeParams","$route","$location","$timeout","$window","LoggerService","Configuration",function a(b,c,d,e,f,g,h,i,j){function k(){i.init(j.loglevel),i.info("############"),i.info("############ APPLICATION INITIALISED"),i.info("############"),a.filters={},a.dateFilters={},a.results={},a.facets={},a.searchType="keyword";var b;b=void 0!==d.site?d.site:j.site,a.deployment=j[j.deployment],a.site=b,a.solr=a.deployment+"/"+a.site+"/select",i.debug("Solr Service: "+a.solr),i.debug("Site: "+a.site),p(),H()>0&&sessionStorage.removeItem("cq");var c=a.loadData();void 0!==c&&c.site!==a.site&&sessionStorage.removeItem("cq");var c=a.loadData();return void 0!==c?n():o(),!0}function l(){var a=sessionStorage.getItem("cq");return angular.fromJson(b.$eval(a))}function m(){var a=l();h.location=a.site===j.site?"#/":"#/"+a.site}function n(){var c=a.loadData();a.appInit=!0,i.info("Initialising app from saved data"),a.q=c.q,a.filters=c.filters,a.dateFilters=c.dateFilters,a.term=c.term,a.searchType=c.searchType,a.sort=c.sort,a.rows=c.nResults,g(function(){b.$broadcast("app-ready"),a.appInit=!1},300)}function o(){a.appInit=!0,i.info("Bootstrapping app"),a.term=void 0!==d.q?d.q:"*",angular.forEach(d,function(b,c){if(-1!==j.allowedRouteParams.indexOf(c)&&"q"!==c){if("object"==typeof b)for(var d=0;d<b.length;d++)a.filterQuery(c,b[d],!0);else a.filterQuery(c,b,!0);a.updateFacetCount(c)}}),angular.forEach(d,function(a,b){-1!==j.allowedRouteParams.indexOf(b)&&f.search(b,null)}),g(function(){b.$broadcast("app-ready"),a.appInit=!1},300)}function p(){if("ESRC"!==a.site){var d={url:a.solr,params:{q:"*:*",rows:1,wt:"json","json.wrf":"JSON_CALLBACK"}};c.jsonp(a.solr,d).then(function(c){a.site_name=c.data.response.docs[0].site_name,a.site_url=c.data.response.docs[0].site_url,i.debug("Searching site: "+a.site_name),b.$broadcast("site-name-retrieved")})}else b.$broadcast("site-name-retrieved")}function q(b){var c,d,e=a.term;"*"===e||"~"===e.substr(-1,1)?c="(name:"+e+"^20 OR altname:"+e+"^10 OR locality:"+e+"^10 OR text:"+e+")":"keyword"===a.searchType?(e=e.replace(/ /gi," "+j.keywordSearchOperator+" "),c="name:("+e+")^100 OR altname:("+e+")^50 OR locality:("+e+")^10 OR text:("+e+")"):c='name:"'+e+'"^100 OR altname:"'+e+'"^50 OR locality:"'+e+'"^10 OR text:"'+e+'"';var f=A().join(" AND ");return void 0===f&&(f=""),d=void 0===a.sort?"*"===e?"name_sort asc":"score desc":a.sort,a.resultSort=d,c={url:a.solr,params:{q:c,start:b,rows:a.rows,wt:"json","json.wrf":"JSON_CALLBACK",fq:f,sort:d}},a.q=c,a.q}function r(){var b={date:Date.now(),term:a.term,q:q(0),filters:a.filters,dateFilters:a.dateFilters,searchType:a.searchType,sort:a.sort,site:a.site,nResults:a.results.docs.length};i.debug("Storing the current query: "+b.date),sessionStorage.setItem("cq",angular.toJson(b))}function s(d,e,f){f&&(a.suggestion=void 0,b.$broadcast("search-suggestion-removed")),(d!==a.term||0===e)&&(a.results.docs=[],a.results.start=0),a.term=d;var g=q(e);i.debug(g),c.jsonp(a.solr,g).then(function(b){0===b.data.response.numFound&&0===Object.keys(a.filters).length?1===d.split(" ").length?(t(a.term),"*"!==d&&"~"!==d.substr(-1,1)&&s(d+"~",0,!1)):u(void 0):u(b)})}function t(d){var e;e={url:a.solr,params:{q:"name:"+d,rows:0,wt:"json","json.wrf":"JSON_CALLBACK"}},i.debug("Suggest: "),i.debug(e),c.jsonp(a.solr,e).then(function(c){a.suggestion=c.data.spellcheck.suggestions[1].suggestion[0],b.$broadcast("search-suggestion-available")})}function u(c){if(void 0===c)a.results={term:a.term,total:0,docs:[]};else{var d,e;if(void 0===a.results.docs)d=c.data.response.docs;else for(d=a.results.docs,e=0;e<c.data.response.docs.length;e++)d.push(c.data.response.docs[e]);for(e=0;e<d.length;e++)d[e].sequenceNo=e;a.results={term:a.term,total:c.data.response.numFound,start:parseInt(c.data.responseHeader.params.start),docs:d}}x(),r(),b.$broadcast("search-results-updated")}function v(){var b=a.results.docs.length;s(a.term,b)}function w(d,e,f){void 0===e&&(e=0),void 0===f&&(f=10);var g=q(0);g.params.facet=!0,g.params["facet.field"]=d,g.params["facet.limit"]=f,g.params["facet.sort"]="count",g.params["facet.offset"]=e,g.params.rows=0,c.jsonp(a.solr,g).then(function(c){angular.forEach(c.data.facet_counts.facet_fields,function(c,d){for(var e=[],f=0;f<c.length;f+=2)e.push([c[f],c[f+1],!1]);a.facets[d]=e,b.$broadcast(d+"-facets-updated")})})}function x(){angular.forEach(a.facets,function(b,c){a.updateFacetCount(c)}),b.$broadcast("update-date-facets")}function y(b,c,d){if(void 0===a.filters[b])a.filters[b]=[c];else if(-1===a.filters[b].indexOf(c))a.filters[b].push(c);else{var e=a.filters[b].indexOf(c);a.filters[b].splice(e,1),0===a.filters[b].length&&delete a.filters[b]}d!==!0&&(a.results.docs=[],a.results.start=0,s(a.term,0,!0))}function z(b,c,d,e){var f,g,h,i;f=e.split(" - ")[0],g=e.split(" - ")[1],i=void 0!==c&&void 0!==d?c+"-"+d+"-"+e.replace(" - ","_"):b+"-"+e.replace(" - ","_"),a.dateFilters[i]?delete a.dateFilters[i]:(h={from:f+"-01-01T00:00:00Z",to:g+"-12-31T23:59:59Z",facetField:b,label:e,existenceFromField:c,existenceToField:d},a.dateFilters[i]=h),a.results.docs=[],a.results.start=0,s(a.term,0,!0)}function A(){var b,c=[];for(b in a.filters){var d=a.filterUnion[b];c.push(b+':("'+a.filters[b].join('" '+d+' "')+'")')}var e=[];for(b in a.dateFilters){var f=a.dateFilters[b];if(void 0!==f.existenceFromField&&void 0!==f.existenceToField){var g,g="(exist_from:["+j.datasetStart+" TO "+f.to+"]";g+=" AND ",g+="exist_to:["+f.from+" TO "+j.datasetEnd+"])",e.push(g)}else{var g=f.facetField+":["+f.from+" TO "+f.to+"]";e.push(g)}}return c.length>0&&e.length>0?c=c.concat(["("+e.join(" OR ")+")"]):e.length>0&&(c=["("+e.join(" OR ")+")"]),c}function B(){a.filters={},a.dateFilters={},s(a.term,0,!0),b.$broadcast("reset-all-filters")}function C(b){delete a.filters[b],s(a.term,0,!0)}function D(){a.hideDetails=!a.hideDetails,b.$broadcast(a.hideDetails===!0?"hide-search-results-details":"show-search-results-details")}function E(){s(a.term,0)}function F(){var b={url:a.solr,params:{q:"*:*",start:0,rows:1,wt:"json","json.wrf":"JSON_CALLBACK",sort:"exist_from asc"}};c.jsonp(a.solr,b).then(function(b){a.dateStartBoundary=b.data.response.docs[0].exist_from;var d={url:a.solr,params:{q:"*:*",start:0,rows:1,wt:"json","json.wrf":"JSON_CALLBACK",sort:"exist_from desc"}};c.jsonp(a.solr,d).then(function(b){a.dateEndBoundary=b.data.response.docs[0].exist_to,a.compileDateFacets()})})}function G(d,e,f,g,h){b.$broadcast("reset-date-facets");var i;i=q(0),i.params.rows=0,i.params.facet=!0,i.params["facet.range"]=d,i.params["facet.range.start"]=f+"-01-01T00:00:00Z",i.params["facet.range.end"]=g+"-12-31T23:59:59Z",i.params["facet.range.gap"]="+"+h+"YEARS",c.jsonp(a.solr,i).then(function(c){var f,i,j=c.data.facet_counts.facet_ranges[d].counts;i=[];var k=(new Date).getFullYear();for(f=0;f<j.length;f+=2){var l=parseInt(j[f].split("-")[0])+parseInt(h)-1;l>g&&(l=g),l>k&&(l=k),i.push({rangeStart:parseInt(j[f].split("-")[0]),rangeEnd:l,count:j[f+1]})}var m=d+"_"+e;a.dateFacets[m]=i,b.$broadcast(m+"-facet-data-ready")})}var H=function(){var a=[];return angular.forEach(f.search(),function(b){a.push(b)}),a.length};b.$on("$routeUpdate",function(){if(!a.appInit)if(d.site!==a.site||H()>0)sessionStorage.removeItem("cq"),k(a.deployment,d.site);else{var b=sessionStorage.getItem("cq");null!==b?n(sessionStorage.getItem("cq")):k(a.deployment,d.site)}});var a={results:{},facets:{},dateFacets:{},filters:{},filterUnion:{},dateFilters:{},searchType:"phrase",term:"*",rows:10,defaultRows:10,sort:void 0,resultSort:void 0,hideDetails:!1,init:k,redirectToRoot:m,loadData:l,search:s,saveData:u,nextPage:v,updateFacetCount:w,filterQuery:y,getFilterObject:A,filterDateQuery:z,clearFilter:C,clearAllFilters:B,toggleDetails:D,reSort:E,dateOuterBounds:F,compileDateFacets:G};return a}]),angular.module("searchApp").service("LoggerService",function(){return{logLevel:"ERROR",init:function(a){this.logLevel=a},log:function(a,b){console.log(a+": ",b)},debug:function(a){"DEBUG"===this.logLevel&&this.log("DEBUG",a)},info:function(a){("INFO"===this.logLevel||"DEBUG"==this.logLevel)&&this.log("INFO",a)},error:function(a){("ERROR"===this.logLevel||"INFO"===this.logLevel||"DEBUG"===this.logLevel)&&this.log("ERROR",a)}}}),angular.module("searchApp").directive("searchResults",["$rootScope","$window","SolrService",function(a,b,c){return{templateUrl:"views/search-results.html",restrict:"E",scope:{displayProvenance:"@"},link:function(a){a.showFilters=!1,a.site=c.site,a.summaryActive="",a.detailsActive="active",a.$on("search-results-updated",function(){a.gridView=!0,angular.forEach(c.results.docs,function(b){void 0===b.thumbnail&&(a.gridView=!1)}),a.results=c.results,a.filters=c.getFilterObject()}),a.$on("search-suggestion-available",function(){a.suggestion=c.suggestion}),a.$on("search-suggestion-removed",function(){a.suggestion=c.suggestion}),a.$on("show-search-results-details",function(){a.summaryActive="",a.detailsActive="active"}),a.$on("hide-search-results-details",function(){a.summaryActive="active",a.detailsActive=""}),a.setSuggestion=function(a){c.search(a,0,!0)},a.loadNextPage=function(){c.nextPage()},a.clearAllFilters=function(){c.clearAllFilters()}}}}]),angular.module("searchApp").directive("genericResultDisplay",["$rootScope","$location","SolrService","ImageService",function(a,b,c,d){return{templateUrl:"views/generic-result-display.html",restrict:"E",scope:{data:"=ngModel",displayProvenance:"@"},link:function(b){b.hideDetails=c.hideDetails,a.$on("hide-search-results-details",function(){b.hideDetails=!0}),a.$on("show-search-results-details",function(){b.hideDetails=!1}),void 0!==b.data.display_url?b.data.resource=b.data.display_url:b.data.reference=b.data.id,"Finding Aid Item"===b.data.type&&void 0!==b.data.large_images&&(b.imageSet=!0,b.imageCount=b.data.small_images.length),b.view=function(){d.push(b.data)}}}}]),angular.module("searchApp").directive("facetWidget",["SolrService",function(a){return{templateUrl:"views/facet-widget.html",restrict:"E",scope:{facetField:"@",label:"@",join:"@",isCollapsed:"@",alwaysOpen:"@",showPaginationControls:"@"},link:function(b){b.ao=void 0===b.alwaysOpen?!1:angular.fromJson(b.alwaysOpen),b.ic=void 0===b.isCollapsed?!0:angular.fromJson(b.isCollapsed),b.sp=void 0===b.showPaginationControls?!0:angular.fromJson(b.showPaginationControls),b.offset=0,b.pageSize=10,b.$on("app-ready",function(){a.updateFacetCount(b.facetField,b.offset,b.pageSize)}),void 0===b.join&&(b.join="OR"),a.filterUnion[b.facetField]=b.join,b.$on(b.facetField+"-facets-updated",function(){var c=a.filters[b.facetField];void 0===c&&(c=[]);var d=a.facets[b.facetField];angular.forEach(d,function(a,e){-1!==c.indexOf(d[e][0])&&(d[e][2]=!0,void 0===b.startup&&(b.ic=!1,b.startup=!1))}),b.facets=d}),b.$on("reset-all-filters",function(){angular.forEach(b.facets,function(a,c){b.facets[c][2]=!1}),b.selected=[]}),b.$on("open-all-filters",function(){b.ic=!1}),b.$on("close-all-filters",function(){b.ic=!0}),b.reset=function(){b.offset=0,b.pageSize=10,a.clearFilter(b.facetField),a.updateFacetCount(b.facetField,b.offset,b.pageSize),angular.forEach(b.facets,function(a,c){b.facets[c][2]=!1}),b.selected=[]},b.facet=function(c){a.filterQuery(b.facetField,c)},b.pageForward=function(){b.offset=b.offset+b.pageSize,a.updateFacetCount(b.facetField,b.offset,b.pageSize)},b.pageBackward=function(){b.offset=b.offset-b.pageSize,b.offset<0&&(b.offset=0),a.updateFacetCount(b.facetField,b.offset,b.pageSize)},b.updatePageSize=function(){null===b.pageSize&&(b.pageSize=10),b.pageSize>1e3&&(b.pageSize=1e3),a.updateFacetCount(b.facetField,b.offset,b.pageSize)}}}}]),angular.module("searchApp").constant("Configuration",{production:"https://solr.esrc.unimelb.edu.au",testing:"https://data.esrc.info/solr",loglevel:"DEBUG",deployment:"testing",allowedRouteParams:["q","type","function","level1","level2","level3"],site:"UMAB",keywordSearchOperator:"AND",datasetStart:"2000-01-01T00:00:00Z",datasetEnd:"2014-12-31T23:59:59Z"}),angular.module("searchApp").directive("sortResults",["$rootScope","SolrService",function(a,b){return{templateUrl:"views/sort-results.html",restrict:"E",link:function(c){c.sortBy=b.resultSort,a.$on("search-results-updated",function(){c.sortBy=b.resultSort}),c.sort=function(){b.sort=c.sortBy,b.reSort()}}}}]),angular.module("searchApp").directive("dateRangeGraph",["$rootScope","$window","SolrService",function(a,b,c){return{templateUrl:"views/date-range-graph.html",restrict:"E",link:function(b){b.startDateBoundary=void 0,b.endDateBoundary=void 0,a.$on("start-date-facet-data-ready",function(){b.dateFacets=c.startDateFacets})}}}]),angular.module("searchApp").directive("dateFacetWidget",["SolrService",function(a){return{templateUrl:"views/date-facet-widget.html",restrict:"E",scope:{facetField:"@",existenceFromField:"@",existenceToField:"@",id:"@",label:"@",start:"@",end:"@",interval:"@",isCollapsed:"@",alwaysOpen:"@",showPaginationControls:"@"},link:function(b){b.ao=void 0===b.alwaysOpen?!1:angular.fromJson(b.alwaysOpen),b.ic=void 0===b.isCollapsed?!0:angular.fromJson(b.isCollapsed),b.sp=void 0===b.showPaginationControls?!0:angular.fromJson(b.showPaginationControls),void 0===b.start&&console.error("start not defined. Need to pass in a year from which to start the facetting."),void 0===b.interval&&console.error("interval not defined. Need to pass in an interval for the range facetting."),void 0===b.id&&console.error("id not defined. Need to pass in an id for the range facetting."),b.$on("app-ready",function(){void 0===b.end&&(b.end=(new Date).getFullYear()),a.compileDateFacets(b.facetField,b.id,b.start,b.end,b.interval)}),b.$on("update-date-facets",function(){a.compileDateFacets(b.facetField,b.id,b.start,b.end,b.interval)}),b.facets=[],b.$on("reset-date-facets",function(){b.facets=[]}),b.$on(b.facetField+"_"+b.id+"-facet-data-ready",function(){var e=a.dateFacets[b.facetField+"_"+b.id];c(e),d()}),b.$on("reset-all-filters",function(){d()}),b.$on("open-all-filters",function(){b.ic=!1}),b.$on("close-all-filters",function(){b.ic=!0});var c=function(a){b.facets=[];var c;angular.forEach(a,function(a){c={start:a.rangeStart,end:a.rangeEnd,label:a.rangeStart+" - "+a.rangeEnd,count:a.count,checked:!1},b.facets.push(c)})},d=function(){{var c=[];b.existenceFromField+"-"+b.existenceToField+"-"}angular.forEach(a.dateFilters,function(a){a.existenceFromField===b.existenceFromField&&a.existenceToField===b.existenceToField&&a.facetField===b.facetField&&c.push(a.label)}),angular.forEach(b.facets,function(a,d){-1!==c.indexOf(a.label)?(b.facets[d].checked=!0,void 0===b.startup&&(b.ic=!1,b.startup=!1)):b.facets[d].checked=!1})};b.toggleFacet=function(c){a.filterDateQuery(b.facetField,b.existenceFromField,b.existenceToField,c),d()}}}}]),angular.module("searchApp").filter("dateFilterPrettifier",function(){return function(a){var b=a.replace(/-01-01T/g,"").replace(/-12-31T/g,"");return b=b.replace(/00:00:00Z/g,"").replace(/23:59:59Z/g,"")}}),angular.module("searchApp").directive("provenanceView",function(){return{templateUrl:"views/provenance-view.html",restrict:"E",scope:{data:"=",displayProvenance:"@"},link:function(){}}}),angular.module("searchApp").directive("displayDobject",["$window","$location","ImageService","LoggerService",function(a,b,c,d){return{templateUrl:"views/display-dobject.html",restrict:"E",scope:{data:"=ngModel"},link:function(a){a.isImage=!1;var b=["jpg","jpeg","png","gif"];if(void 0===a.data.fullsize)d.error("No full size image for: "+a.data.id);else{var e=a.data.fullsize,f=e.split("/"),g=f.pop();f=g.split(".").pop(),void 0!==f&&-1!==b.indexOf(f.toLowerCase())&&(a.isImage=!0)}a.view=function(){c.push(a.data)}}}}]),angular.module("searchApp").directive("displayPublication",function(){return{templateUrl:"views/display-publication.html",restrict:"E",scope:{data:"=ngModel"},link:function(){}}}),angular.module("searchApp").directive("displayArcresource",function(){return{templateUrl:"views/display-arcresource.html",restrict:"E",scope:{data:"=ngModel"},link:function(){}}}),angular.module("searchApp").directive("displayEntity",function(){return{templateUrl:"views/display-entity.html",restrict:"E",scope:{data:"=ngModel"},link:function(){}}}),angular.module("searchApp").service("ImageService",["$location",function b(a){function c(c){b.data=c,sessionStorage.setItem("view",JSON.stringify(c)),a.url("view")}function d(){if(void 0===b.data){var a=JSON.parse(sessionStorage.getItem("view"));b.data=a}return b.data}function e(){}function f(a){var b=["jpg","jpeg","png","gif"];if(void 0===a)return!1;var c=a.split(".").pop();return void 0!==c&&-1!==b.indexOf(c.toLowerCase())?!0:!1}var b={data:void 0,push:c,get:d,drop:e,isImage:f};return b}]),angular.module("searchApp").directive("viewOne",["$window","ImageService","SolrService",function(a,b,c){return{templateUrl:"views/view-one.html",restrict:"E",scope:{},link:function(d){void 0===c.results.docs&&c.redirectToRoot(),d.showLoadingIndicator=!0,d.showImage=null,d.$on("search-results-updated",function(){g(),h()});var e=angular.element(a);e.bind("resize",function(){d.$apply(function(){f()})});var f=function(){d.height=a.innerHeight,d.width=a.innerWidth,d.image_pane_height=.9*a.innerHeight,d.image_label_height=a.innerHeight-d.image_pane_height};f();var g=function(){if(void 0!==c.results.docs)if(d.data.sequenceNo===c.results.docs.length-1)c.nextPage();else{var a=c.results.docs[d.sequenceNo+1];d.hideNextPager=b.isImage(a.fullsize)?!1:!0}},h=function(){if(void 0!==c.results.docs)if(0!==d.sequenceNo){var a=c.results.docs[d.sequenceNo-1];d.hidePreviousPager=b.isImage(a.fullsize)?!1:!0}else d.hidePreviousPager=!0};d.data=b.get(),d.sequenceNo=d.data.sequenceNo,g(),h(),d.back=function(){a.history.back()},d.previous=function(){0!==d.sequenceNo&&(d.sequenceNo-=1,d.data=c.results.docs[d.sequenceNo],g(),h())},d.next=function(){d.sequenceNo+=1,d.data=c.results.docs[d.sequenceNo],g(),h()}}}}]),angular.module("searchApp").directive("viewSet",["$window","$location","$anchorScroll","$timeout","ImageService",function(a,b,c,d,e){return{templateUrl:"views/view-set.html",restrict:"E",scope:{},link:function(f){f.showFilmstrip=!0,f.showInformation=!1,f.data=e.get();var g=angular.element(a);g.bind("resize",function(){f.$apply(function(){h(),f.loadImage(f.current)})});var h=function(){f.height=a.innerHeight,f.width=a.innerWidth,f.navbar_height=50,f.showFilmstrip===!0?(f.image_pane_height=.8*(a.innerHeight-f.navbar_height),f.filmstrip_height=a.innerHeight-f.navbar_height-f.image_pane_height,f.image_height=.9*f.filmstrip_height):f.image_pane_height=a.innerHeight-f.navbar_height};h(),f.smallImages=[],f.largeImageMap={},f.styleMap={},f.largeImageById=[],angular.forEach(f.data.large_images,function(a){var b=a.split("_");f.largeImageMap[b[1]]=f.data.source+"/images/"+f.data.item_id+"/large/"+a,f.styleMap[b[1]]="",f.largeImageById.push(b[1])}),angular.forEach(f.data.small_images,function(a){f.smallImages.push({id:a.split("_")[1],src:f.data.source+"/images/"+f.data.item_id+"/small/"+a})}),f.loadImage=function(a){f.show=!1,f.styleMap[f.current]="",f.styleMap[a]="highlight-current",f.image=f.largeImageMap[a],f.current=a,f.displaying=f.largeImageById.indexOf(f.current)+1+" of "+f.largeImageById.length;var e=b.hash();b.hash(a),c(),b.hash(e),d(function(){f.show=!0},100),0==f.largeImageById.indexOf(f.current)?(f.showNext=!0,f.showPrevious=!1):f.largeImageById.indexOf(f.current)==f.largeImageById.length-1?(f.showNext=!1,f.showPrevious=!0):(f.showNext=!0,f.showPrevious=!0)};var i=f.data.large_images[0];f.current=i.split("_")[1],f.loadImage(f.current),f.next=function(){var a=f.largeImageById.indexOf(f.current);if(a<f.largeImageById.length-1){var b=f.largeImageById[a+1];f.loadImage(b)}},f.previous=function(){var a=f.largeImageById.indexOf(f.current);if(a>0){var b=f.largeImageById[a-1];f.loadImage(b)}},f.jumpToStart=function(){var a=f.largeImageById[0];f.loadImage(a)},f.jumpToEnd=function(){var a=f.largeImageById[f.largeImageById.length-1];f.loadImage(a)},f.toggleFilmstrip=function(){f.showFilmstrip=!f.showFilmstrip,h()},f.toggleInformation=function(){f.showInformation=!f.showInformation}}}}]),angular.module("searchApp").directive("smoothzoom",["$window",function(){return{templateUrl:"views/smoothzoom-view.html",restrict:"A",link:function(a,b){a.init=function(){b.smoothZoom({animation_SPEED_ZOOM:.5,animation_SPEED_PAN:.5,animation_SMOOTHNESS:5,zoom_MAX:400,background_COLOR:"black",button_ALIGN:"top right",button_AUTO_HIDE:!0,button_SIZE:26,responsive:!0})},a.$watch("image_pane_height",function(){b.smoothZoom("destroy"),a.init()}),a.$watch("element.src",function(){a.init()})}}}]),angular.module("searchApp").directive("gridView",["SolrService","ImageService","$window",function(a,b,c){return{templateUrl:"views/grid-view.html",restrict:"E",scope:{},link:function(d){d.rowCount=3,d.isImage=!1;var e=function(){d.docs=[],d.results=a.results.docs;for(var c=0;c<d.results.length;c+=d.rowCount){var e=[];d.results.sequenceNo=c;for(var f=0;f<d.rowCount;f++)void 0!==d.results[c+f]&&(d.results[c+f].isImage=b.isImage(d.results[c+f].fullsize)?!0:!1,e.push(d.results[c+f]));d.docs.push(e)}};e(),d.$on("search-results-updated",function(){e()}),d.view=function(a){a.isImage?b.push(a):c.location=a.fullsize}}}}]),angular.module("searchApp").filter("valueOrDash",function(){return function(a){return void 0===a?"-":a}});