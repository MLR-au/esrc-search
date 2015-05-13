"use strict";angular.module("searchApp",["ngCookies","ngSanitize","ngRoute","ngAnimate"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl",reloadOnSearch:!1}).when("/view",{templateUrl:"views/image-view.html",controller:"ImageViewCtrl"}).when("/:site",{templateUrl:"views/main.html",controller:"MainCtrl",reloadOnSearch:!1}).otherwise({redirectTo:"/"})}]),angular.module("searchApp").controller("MainCtrl",["$rootScope","$scope","$window","$location","SolrService",function(a,b,c,d,e){var f=angular.element(c);f.bind("resize",function(){b.$apply(function(){g()})});var g=function(){if(b.w=c.innerWidth,b.h=c.innerHeight,b.w<760){var a=c.location.hash.split("/")[1];c.location.replace(""!==a?"/basic-search/#/"+a:"/basic-search")}else b.t=160;b.w<1050?(b.lpw=Math.floor(.35*b.w)-1,b.rpw=b.w-b.lpw-1):(b.lpw=Math.floor(.25*b.w)-1,b.rpw=b.w-b.lpw-1),b.topbarStyle={position:"fixed",top:"0px",width:"100%","z-index":"10000",padding:"0px 10px"},b.contentPanelStyle={position:"fixed",top:b.t+"px",width:c.innerWidth-15+"px"},b.sideBarStyle={height:c.innerHeight-b.t-15+"px","overflow-y":"scroll"},b.resultsPanelStyle={height:c.innerHeight-b.t+"px","overflow-y":"scroll"}};g(),b.$on("show-search-results-details",function(){b.detailsActive=!1}),b.$on("hide-search-results-details",function(){b.detailsActive=!0}),b.$on("site-name-retrieved",function(){"ESRC"===e.site?(b.site_name="Search the datasets.",b.site_url=d.absUrl(),b.returnToSiteLink=!1):(b.site_name="Search: "+e.site_name,b.site_url=e.site_url,b.returnToSiteLink=!0)}),b.toggleDetails=function(){e.toggleDetails()},b.clearAllFilters=function(){e.clearAllFilters()},b.openAllFilters=function(){a.$broadcast("open-all-filters")},b.closeAllFilters=function(){a.$broadcast("close-all-filters")}}]),angular.module("searchApp").controller("ImageViewCtrl",["$scope","ImageService",function(a,b){var c=b.get();"OHRM"===c.data_type?a.single=!0:a.set=!0}]),angular.module("searchApp").directive("searchForm",["$routeParams","$location","SolrService",function(a,b,c){return{templateUrl:"views/search-form.html",restrict:"E",scope:{help:"@",searchType:"@"},link:function(d){d.$on("app-ready",function(){d.searchBox=c.term,d.start=c.start,c.searchType!==d.searchType?d.setSearchType(c.searchType,!1):d.setSearchType(d.searchType,!1),d.search(d.start)}),d.$on("search-results-updated",function(){d.searchBox=c.term}),d.setSearchBox=function(){if(void 0!==a.q)if(angular.isArray(a.q)){var c=b.search();d.searchBox=a.q[0],b.search("q",c.q[0])}else d.searchBox=a.q;else d.searchBox="*"},d.search=function(a){""===d.searchBox&&(d.searchBox="*"),void 0===a&&(a=0),c.search(d.searchBox,a,!0)},d.reset=function(){c.reset()},d.setSearchType=function(a,b){c.searchType=a,"phrase"===c.searchType?(d.keywordSearch=!1,d.phraseSearch=!0):(d.phraseSearch=!1,d.keywordSearch=!0),b!==!1&&d.search()},d.setSearchBox(),d.ready=c.init()}}}]),angular.module("searchApp").factory("SolrService",["$rootScope","$http","$routeParams","$route","$location","$timeout","$window","LoggerService","Configuration",function a(b,c,d,e,f,g,h,i,j){function k(){i.init(j.loglevel),i.info("############"),i.info("############ APPLICATION INITIALISED"),i.info("############"),a.filters={},a.dateFilters={},a.results={},a.facets={},a.searchType="keyword",a.deployment=j[j.deployment],a.site=j.site,a.solr=a.deployment+"/"+a.site+"/select",i.debug("Solr Service: "+a.solr),i.debug("Site: "+a.site),p(),I()>0&&sessionStorage.removeItem("cq");var b=a.loadData();void 0!==b&&b.site!==a.site&&sessionStorage.removeItem("cq");var b=a.loadData();return void 0!==b?n():o(),!0}function l(){var a=sessionStorage.getItem("cq");return angular.fromJson(b.$eval(a))}function m(){var a=l();h.location=a.site===j.site?"#/":"#/"+a.site}function n(){var c=a.loadData();a.appInit=!0,i.info("Initialising app from saved data"),a.q=c.q,a.filters=c.filters,a.dateFilters=c.dateFilters,a.term=c.term,a.searchType=c.searchType,a.sort=c.sort,a.start=c.start,g(function(){b.$broadcast("app-ready"),a.appInit=!1},300)}function o(){a.appInit=!0,i.info("Bootstrapping app");var c=angular.copy(f.search());a.term=void 0!==c.q?c.q:"*",c.q&&delete c.q,angular.forEach(c,function(b,c){if("object"==typeof b)for(var d=0;d<b.length;d++)a.filterQuery(c,b[d],!0);else a.filterQuery(c,b,!0)}),f.search({}).replace(),g(function(){b.$broadcast("app-ready"),a.appInit=!1},300)}function p(){if("ESRC"!==a.site){var d={url:a.solr,params:{q:"*:*",rows:1,wt:"json","json.wrf":"JSON_CALLBACK"}};c.jsonp(a.solr,d).then(function(c){a.site_name=c.data.response.docs[0].site_name,a.site_url=c.data.response.docs[0].site_url,i.debug("Searching site: "+a.site_name),b.$broadcast("site-name-retrieved")})}else b.$broadcast("site-name-retrieved")}function q(b){var c,d=[],e=a.term,e=a.term,f=[{name:"name",weight:"100"},{name:"altname",weight:"50"},{name:"locality",weight:"30"},{name:"text",weight:"10"},{name:"description",weight:"1"}];"*"===e||"~"===e.substr(-1,1)?angular.forEach(f,function(a){d.push(a.name+":("+e+")^"+a.weight+" ")}):"keyword"===a.searchType?(e=e.replace(/ /gi," "+j.keywordSearchOperator+" "),angular.forEach(f,function(a){d.push(a.name+":("+e+")^"+a.weight+" ")})):angular.forEach(f,function(a){d.push(a.name+':"'+e+'"^'+a.weight+" ")}),d=d.join(" OR ");var g=A().join(" AND ");return void 0===g&&(g=""),c=void 0===a.sort?"*"===e?"name_sort asc":"score desc":a.sort,a.resultSort=c,d={url:a.solr,params:{q:d,start:b,rows:a.rows,wt:"json","json.wrf":"JSON_CALLBACK",fq:g,sort:c}},a.q=d,a.q}function r(){var b={date:Date.now(),term:a.term,q:q(0),filters:a.filters,dateFilters:a.dateFilters,searchType:a.searchType,sort:a.sort,site:a.site,start:a.start};i.debug("Storing the current query: "+b.date),sessionStorage.setItem("cq",angular.toJson(b))}function s(d,e,f){f&&(a.suggestion=void 0,b.$broadcast("search-suggestion-removed")),(d!==a.term||0===e)&&(a.results.docs=[],a.results.start=0),a.term=d;var g=q(e);i.debug(g),c.jsonp(a.solr,g).then(function(b){0===b.data.response.numFound&&0===Object.keys(a.filters).length?1===d.split(" ").length?(t(a.term),"*"!==d&&"~"!==d.substr(-1,1)&&s(d+"~",0,!1)):u(void 0):u(b)})}function t(d){var e;e={url:a.solr,params:{q:"name:"+d,rows:0,wt:"json","json.wrf":"JSON_CALLBACK"}},i.debug("Suggest: "),i.debug(e),c.jsonp(a.solr,e).then(function(c){a.suggestion=c.data.spellcheck.suggestions[1].suggestion[0],b.$broadcast("search-suggestion-available")})}function u(c){if(void 0===c)a.results={term:a.term,total:0,docs:[]};else{var d,e=[];d=parseInt(c.data.responseHeader.params.start),angular.forEach(c.data.response.docs,function(a,b){a.sequenceNo=b+d,e.push(a)}),a.results={dateStamp:(new Date).getTime(),term:a.term,total:c.data.response.numFound,start:d,docs:e}}x(),r(),b.$broadcast("search-results-updated")}function v(){var b=a.results.start+a.rows;a.start=b,s(a.term,b)}function w(d,e,f,g){void 0===e&&(e=0),void 0===f&&(f=-1),void 0===g&&(g="count");var h=q(0);h.params.facet=!0,h.params["facet.field"]=d,h.params["facet.limit"]=f,h.params["facet.sort"]=g,h.params["facet.offset"]=e,h.params.rows=0,c.jsonp(a.solr,h).then(function(c){angular.forEach(c.data.facet_counts.facet_fields,function(c,d){for(var e=[],f=0;f<c.length;f+=2)e.push([c[f],c[f+1],!1]);a.facets[d]=e,b.$broadcast(d+"-facets-updated")})})}function x(){b.$broadcast("update-all-facets"),b.$broadcast("update-date-facets")}function y(b,c,d){if(void 0===a.filters[b])a.filters[b]=[c];else if(-1===a.filters[b].indexOf(c))a.filters[b].push(c);else{var e=a.filters[b].indexOf(c);a.filters[b].splice(e,1),0===a.filters[b].length&&delete a.filters[b]}d!==!0&&(a.results.docs=[],a.results.start=0,s(a.term,0,!0))}function z(b,c,d,e){var f,g,h;f=e.split(" - ")[0],g=e.split(" - ")[1],h={from:f+"-01-01T00:00:00Z",to:g+"-12-31T23:59:59Z",facetField:b,label:e,existenceFromField:c,existenceToField:d},a.dateFilters.date_filter=h,a.results.docs=[],a.results.start=0,s(a.term,0,!0)}function A(){var b,c=[];for(b in a.filters){var d=a.filterUnion[b];c.push(b+':("'+a.filters[b].join('" '+d+' "')+'")')}var e=[];for(b in a.dateFilters){var f=a.dateFilters[b];if(void 0!==f.existenceFromField&&void 0!==f.existenceToField){var g,g="(exist_from:["+j.datasetStart+" TO "+f.to+"]";g+=" AND ",g+="exist_to:["+f.from+" TO "+j.datasetEnd+"])",e.push(g)}else{var g=f.facetField+":["+f.from+" TO "+f.to+"]";e.push(g)}}return c.length>0&&e.length>0?c=c.concat(["("+e.join(" OR ")+")"]):e.length>0&&(c=["("+e.join(" OR ")+")"]),c}function B(){a.filters={},a.dateFilters={},s(a.term,0,!0),b.$broadcast("reset-all-filters")}function C(){a.term="*",a.clearAllFilters()}function D(b){delete a.filters[b],s(a.term,0,!0)}function E(){a.hideDetails=!a.hideDetails,b.$broadcast(a.hideDetails===!0?"hide-search-results-details":"show-search-results-details")}function F(){s(a.term,0)}function G(){var b={url:a.solr,params:{q:"*:*",start:0,rows:1,wt:"json","json.wrf":"JSON_CALLBACK",sort:"exist_from asc"}};c.jsonp(a.solr,b).then(function(b){a.dateStartBoundary=b.data.response.docs[0].exist_from;var d={url:a.solr,params:{q:"*:*",start:0,rows:1,wt:"json","json.wrf":"JSON_CALLBACK",sort:"exist_from desc"}};c.jsonp(a.solr,d).then(function(b){a.dateEndBoundary=b.data.response.docs[0].exist_to,a.compileDateFacets()})})}function H(d,e,f,g,h){b.$broadcast("reset-date-facets");var i;i=q(0),i.params.rows=0,i.params.facet=!0,i.params["facet.range"]=d,i.params["facet.range.start"]=f+"-01-01T00:00:00Z",i.params["facet.range.end"]=g+"-12-31T23:59:59Z",i.params["facet.range.gap"]="+"+h+"YEARS",c.jsonp(a.solr,i).then(function(c){var f,i,j=c.data.facet_counts.facet_ranges[d].counts;i=[];var k=(new Date).getFullYear();for(f=0;f<j.length;f+=2){var l=parseInt(j[f].split("-")[0])+parseInt(h)-1;l>g&&(l=g),l>k&&(l=k),i.push({rangeStart:parseInt(j[f].split("-")[0]),rangeEnd:l,count:j[f+1]})}var m=d+"_"+e;a.dateFacets[m]=i,b.$broadcast(m+"-facet-data-ready")})}var I=function(){var a=[];return angular.forEach(f.search(),function(b){a.push(b)}),a.length};b.$on("$routeUpdate",function(){if(!a.appInit)if(d.site!==a.site||I()>0)sessionStorage.removeItem("cq"),k(a.deployment,d.site);else{var b=sessionStorage.getItem("cq");null!==b?n(sessionStorage.getItem("cq")):k(a.deployment,d.site)}});var a={results:{},facets:{},dateFacets:{},filters:{},filterUnion:{},dateFilters:{},searchType:"phrase",term:"*",rows:10,sort:void 0,resultSort:void 0,hideDetails:!1,init:k,redirectToRoot:m,loadData:l,search:s,saveData:u,nextPage:v,updateFacetCount:w,filterQuery:y,getFilterObject:A,filterDateQuery:z,clearFilter:D,clearAllFilters:B,reset:C,toggleDetails:E,reSort:F,dateOuterBounds:G,compileDateFacets:H};return a}]),angular.module("searchApp").service("LoggerService",["$log",function(a){return{logLevel:"ERROR",init:function(a){this.logLevel=a},log:function(b,c){a.log(b+": ",c)},debug:function(a){"DEBUG"===this.logLevel&&this.log("DEBUG",a)},info:function(a){("INFO"===this.logLevel||"DEBUG"==this.logLevel)&&this.log("INFO",a)},error:function(a){("ERROR"===this.logLevel||"INFO"===this.logLevel||"DEBUG"===this.logLevel)&&this.log("ERROR",a)}}}]),angular.module("searchApp").directive("searchResults",["$rootScope","$window","$location","$anchorScroll","SolrService",function(a,b,c,d,e){return{templateUrl:"views/search-results.html",restrict:"E",scope:{displayProvenance:"@"},link:function(a){a.showFilters=!1,a.site=e.site,a.summaryActive="",a.detailsActive="active",a.$on("search-results-updated",function(){a.results=e.results,a.filters=e.getFilterObject(),a.togglePageControls();var b=c.hash();c.hash("topSearchResults"),d(),c.hash(b)}),a.$on("search-suggestion-available",function(){a.suggestion=e.suggestion}),a.$on("search-suggestion-removed",function(){a.suggestion=e.suggestion}),a.$on("show-search-results-details",function(){a.summaryActive="",a.detailsActive="active"}),a.$on("hide-search-results-details",function(){a.summaryActive="active",a.detailsActive=""}),a.setSuggestion=function(a){e.search(a,0,!0)},a.nextPage=function(){e.nextPage()},a.previousPage=function(){e.previousPage()},a.togglePageControls=function(){a.disablePrevious=0===e.results.start?!0:!1,a.disableNext=e.results.start+e.rows>=a.results.total?!0:!1},a.clearAllFilters=function(){e.clearAllFilters()}}}}]),angular.module("searchApp").directive("genericResultDisplay",["$rootScope","$location","SolrService","ImageService",function(a,b,c,d){return{templateUrl:"views/generic-result-display.html",restrict:"E",scope:{data:"=ngModel",displayProvenance:"@"},link:function(b){b.hideDetails=c.hideDetails,a.$on("hide-search-results-details",function(){b.hideDetails=!0}),a.$on("show-search-results-details",function(){b.hideDetails=!1}),b.data.reference=void 0!==b.data.display_url?b.data.display_url:b.data.id,"Finding Aid Item"===b.data.type&&void 0!==b.data.large_images&&(b.imageSet=!0,b.imageCount=b.data.small_images.length),b.view=function(){d.push(b.data)}}}}]),angular.module("searchApp").directive("facetWidget",["SolrService","Configuration","$location","$anchorScroll",function(a,b,c,d){return{templateUrl:"views/facet-widget.html",restrict:"E",scope:{facetField:"@",label:"@",join:"@",isCollapsed:"@",alwaysOpen:"@",showPaginationControls:"@",limit:"@",sortBy:"@"},link:function(e){e.ao=void 0===e.alwaysOpen?!1:angular.fromJson(e.alwaysOpen),e.ic=void 0===e.isCollapsed?!0:angular.fromJson(e.isCollapsed),e.sp=void 0===e.showPaginationControls?!0:angular.fromJson(e.showPaginationControls),e.sb=void 0===e.sortBy?"count":e.sortBy,e.l=void 0===e.limit?!1:angular.fromJson(e.limit),e.offset=0,e.pageSize=e.sp===!1?-1:10;var f=function(){a.updateFacetCount(e.facetField,e.offset,e.pageSize,e.sb)};e.$on("app-ready",function(){f()}),e.$on("update-all-facets",function(){f()}),void 0===e.join&&(e.join="OR"),a.filterUnion[e.facetField]=e.join,e.$on(e.facetField+"-facets-updated",function(){var c=a.filters[e.facetField];void 0===c&&(c=[]);var d=[],f=[];try{var g=b.facetFilter[e.facetField].filterModel,h=b.facetFilter[e.facetField].pivotField}catch(i){}if(void 0!==g&&void 0!==h&&angular.forEach(a.facets[h],function(a){1==a[2]&&angular.forEach(g[a[0]],function(a){f.push(a)})}),angular.forEach(a.facets[e.facetField],function(a){-1!==c.indexOf(a[0])&&(a[2]=!0,void 0===e.startup&&(e.ic=!1,e.startup=!1)),void 0!==g&&void 0!==h?-1!==f.indexOf(a[0])&&d.push(a):d.push(a)}),e.facetResults=d,e.sp===!1&&e.l===!0&&e.allShowing!==!0){var j=0;angular.forEach(d,function(a){a[2]&&(j+=1)}),0===j&&(j=3),e.facets=d.slice(0,j)}else e.facets=d}),e.$on("reset-all-filters",function(){angular.forEach(e.facets,function(a,b){e.facets[b][2]=!1}),e.selected=[]}),e.$on("open-all-filters",function(){e.ic=!1}),e.$on("close-all-filters",function(){e.ic=!0}),e.reset=function(){e.offset=0,e.pageSize=e.sp===!1?-1:10,a.clearFilter(e.facetField),f(),angular.forEach(e.facets,function(a,b){e.facets[b][2]=!1}),e.selected=[]},e.facet=function(b){a.filterQuery(e.facetField,b);var f=c.hash();c.hash("top_"+e.facetField),d(),c.hash(f)},e.pageForward=function(){e.offset=e.offset+e.pageSize,f()},e.pageBackward=function(){e.offset=e.offset-e.pageSize,e.offset<0&&(e.offset=0),f()},e.updatePageSize=function(){null===e.pageSize&&(e.pageSize=10),e.pageSize>1e3&&(e.pageSize=1e3),f()},e.showAll=function(){e.facets=e.facetResults,e.allShowing=!0},e.hide=function(){e.allShowing=!1,e.facetResults=e.facets;var a=0;angular.forEach(e.facets,function(b){b[2]&&(a+=1)}),0===a&&(a=3),e.facets=angular.copy(e.facets).slice(0,a)}}}}]),angular.module("searchApp").constant("Configuration",{production:"https://solr.esrc.unimelb.edu.au",testing:"https://data.esrc.info/solr",loglevel:"DEBUG",deployment:"production",allowedRouteParams:["q","resource_type","type","function"],site:"FACP",keywordSearchOperator:"OR",datasetStart:"1788-01-01T00:00:00Z",datasetEnd:"2014-12-31T23:59:59Z"}),angular.module("searchApp").directive("sortResults",["SolrService",function(a){return{templateUrl:"views/sort-results.html",restrict:"E",link:function(b){b.sortBy=a.resultSort,b.$on("search-results-updated",function(){b.sortBy=a.resultSort}),b.sort=function(){a.sort=b.sortBy,a.reSort()}}}}]),angular.module("searchApp").directive("dateRangeGraph",["$rootScope","$window","SolrService",function(a,b,c){return{templateUrl:"views/date-range-graph.html",restrict:"E",link:function(b){b.startDateBoundary=void 0,b.endDateBoundary=void 0,a.$on("start-date-facet-data-ready",function(){b.dateFacets=c.startDateFacets})}}}]),angular.module("searchApp").directive("dateFacetWidget",["$log","SolrService",function(a,b){return{templateUrl:"views/date-facet-widget.html",restrict:"E",scope:{facetField:"@",existenceFromField:"@",existenceToField:"@",id:"@",label:"@",start:"@",end:"@",interval:"@",isCollapsed:"@",alwaysOpen:"@",showPaginationControls:"@"},link:function(c){c.ao=void 0===c.alwaysOpen?!1:angular.fromJson(c.alwaysOpen),c.ic=void 0===c.isCollapsed?!0:angular.fromJson(c.isCollapsed),c.sp=void 0===c.showPaginationControls?!0:angular.fromJson(c.showPaginationControls),void 0===c.start&&a.error("start not defined. Need to pass in a year from which to start the facetting."),void 0===c.interval&&a.error("interval not defined. Need to pass in an interval for the range facetting."),void 0===c.id&&a.error("id not defined. Need to pass in an id for the range facetting."),c.$on("app-ready",function(){void 0===c.end&&(c.end=(new Date).getFullYear()),b.compileDateFacets(c.facetField,c.id,c.start,c.end,c.interval)}),c.$on("update-date-facets",function(){b.compileDateFacets(c.facetField,c.id,c.start,c.end,c.interval)}),c.facets=[],c.$on("reset-date-facets",function(){c.facets=[]}),c.$on(c.facetField+"_"+c.id+"-facet-data-ready",function(){var a=b.dateFacets[c.facetField+"_"+c.id];d(a),e()}),c.$on("reset-all-filters",function(){e()}),c.$on("open-all-filters",function(){c.ic=!1}),c.$on("close-all-filters",function(){c.ic=!0});var d=function(a){c.facets=[];var b;angular.forEach(a,function(a){b={start:a.rangeStart,end:a.rangeEnd,label:a.rangeStart+" - "+a.rangeEnd,count:a.count,checked:!1},c.facets.push(b)})},e=function(){{var a=[];c.existenceFromField+"-"+c.existenceToField+"-"}angular.forEach(b.dateFilters,function(b){b.existenceFromField===c.existenceFromField&&b.existenceToField===c.existenceToField&&b.facetField===c.facetField&&a.push(b.label)}),angular.forEach(c.facets,function(b,d){-1!==a.indexOf(b.label)?(c.facets[d].checked=!0,void 0===c.startup&&(c.ic=!1,c.startup=!1)):c.facets[d].checked=!1})};c.toggleFacet=function(a){b.filterDateQuery(c.facetField,c.existenceFromField,c.existenceToField,a),e()}}}}]),angular.module("searchApp").filter("dateFilterPrettifier",function(){return function(a){var b=a.replace(/-01-01T/g,"").replace(/-12-31T/g,"");return b=b.replace(/00:00:00Z/g,"").replace(/23:59:59Z/g,"")}}),angular.module("searchApp").directive("provenanceView",function(){return{templateUrl:"views/provenance-view.html",restrict:"E",scope:{data:"=",displayProvenance:"@"},link:function(){}}}),angular.module("searchApp").directive("displayDobject",["$window","$location","ImageService","LoggerService",function(a,b,c,d){return{templateUrl:"views/display-dobject.html",restrict:"E",scope:{data:"=ngModel"},link:function(b){b.isImage=!1;var e=["jpg","jpeg","png","gif"];if(void 0===b.data.fullsize)d.error("No full size image for: "+b.data.id);else{var f=b.data.fullsize,g=f.split("/"),h=g.pop();g=h.split(".").pop(),void 0!==g&&-1!==e.indexOf(g.toLowerCase())&&(b.isImage=!0)}b.view=function(b){b.isImage?c.push(b):a.location=b.fullsize}}}}]),angular.module("searchApp").directive("displayPublication",function(){return{templateUrl:"views/display-publication.html",restrict:"E",scope:{data:"=ngModel"},link:function(){}}}),angular.module("searchApp").directive("displayArcresource",function(){return{templateUrl:"views/display-arcresource.html",restrict:"E",scope:{data:"=ngModel"},link:function(){}}}),angular.module("searchApp").directive("displayEntity",function(){return{templateUrl:"views/display-entity.html",restrict:"E",scope:{data:"=ngModel"},link:function(a){try{-1!==a.data["function"].indexOf("Home")&&(a.data.type=a.data.type+" - Home")}catch(b){}}}}),angular.module("searchApp").service("ImageService",["$location",function b(a){function c(c){b.data=c,sessionStorage.setItem("view",JSON.stringify(c)),a.url("view")}function d(){if(void 0===b.data){var a=JSON.parse(sessionStorage.getItem("view"));b.data=a}return b.data}function e(){}function f(a){var b=["jpg","jpeg","png","gif"];if(void 0===a)return!1;var c=a.split(".").pop();return void 0!==c&&-1!==b.indexOf(c.toLowerCase())?!0:!1}var b={data:void 0,push:c,get:d,drop:e,isImage:f};return b}]),angular.module("searchApp").directive("viewOne",["$window","ImageService","SolrService",function(a,b,c){return{templateUrl:"views/view-one.html",restrict:"E",scope:{},link:function(d){void 0===c.results.docs&&c.redirectToRoot(),d.showLoadingIndicator=!0,d.showImage=null,d.$on("search-results-updated",function(){g(),h()});var e=angular.element(a);e.bind("resize",function(){d.$apply(function(){f()})});var f=function(){d.height=a.innerHeight,d.width=a.innerWidth,d.image_pane_height=.9*a.innerHeight,d.image_label_height=a.innerHeight-d.image_pane_height,d.imageViewPanel={height:d.image_pane_height+"px",width:"100%"},d.infoPanelBackStyle={position:"fixed",left:"0px",top:d.height-60+"px",height:"60px",width:"100%","z-index":"100",opacity:"0.9","background-color":"#EFEFEA"},d.infoPanelFrontStyle={position:"fixed",left:"0px",top:d.height-60+"px",height:"60px",width:"100%","z-index":"200","padding-top":"10px"},d.showInfoPanelStyle={position:"fixed",left:"0px",top:d.height-30+"px",width:"100%","z-index":"200"}};f();var g=function(){if(void 0!==c.results.docs)if(d.data.sequenceNo===c.results.docs.length-1)c.nextPage();else{var a=c.results.docs[d.sequenceNo+1];d.hideNextPager=b.isImage(a.fullsize)?!1:!0}},h=function(){if(void 0!==c.results.docs)if(0!==d.sequenceNo){var a=c.results.docs[d.sequenceNo-1];d.hidePreviousPager=b.isImage(a.fullsize)?!1:!0}else d.hidePreviousPager=!0};d.data=b.get(),d.sequenceNo=d.data.sequenceNo,g(),h(),d.back=function(){a.history.back()},d.previous=function(){0!==d.sequenceNo&&(d.sequenceNo-=1,d.data=c.results.docs[d.sequenceNo],g(),h())},d.next=function(){d.sequenceNo+=1,d.data=c.results.docs[d.sequenceNo],g(),h()}}}}]),angular.module("searchApp").directive("viewSet",["$window","$location","$anchorScroll","$timeout","ImageService",function(a,b,c,d,e){return{templateUrl:"views/view-set.html",restrict:"E",scope:{},link:function(f){f.showFilmstrip=!0,f.showInformation=!1,f.data=e.get();var g=angular.element(a);g.bind("resize",function(){f.$apply(function(){h(),f.loadImage(f.current)})});var h=function(){f.height=a.innerHeight,f.width=a.innerWidth,f.navbar_height=50,f.showFilmstrip===!0?(f.image_pane_height=.8*(a.innerHeight-f.navbar_height),f.filmstrip_height=a.innerHeight-f.navbar_height-f.image_pane_height,f.image_height=.9*f.filmstrip_height):f.image_pane_height=a.innerHeight-f.navbar_height,f.navbarStyle={position:"fixed",top:"0px",left:"0px",height:f.navbar_height+"px",width:"100%","background-color":"black"},f.infoPanelBackStyle={position:"fixed",top:"0px",left:"0px",height:f.height+"px",width:f.width+"px","z-index":"10",opacity:"0.6","background-color":"#e0e0e0"},f.infoPanelFrontStyle={position:"fixed",top:"10%",left:"10%",height:"500px",width:"400px","z-index":"20","background-color":"white","border-radius":"8px","box-shadow":"10px 10px 5px #888888",padding:"15px"},f.imageViewPanel={position:"fixed",top:f.navbar_height+"px",left:"0px",height:f.image_pane_height+"px",width:"100%","background-color":"black",display:"inline"},f.imageViewPanelLeft={position:"absolute",height:f.image_pane_height-10+"px",width:.05*f.width+"px",left:"0px"},f.imageViewPanelCentre={position:"absolute",height:f.image_pane_height-10+"px",width:.9*f.width+"px",left:.05*f.width+"px"},f.imageViewPanelRight={position:"absolute",height:f.image_pane_height-10+"px",width:.05*f.width+"px",left:.95*f.width+"px"},f.filmstripPanel={position:"fixed",top:f.navbar_height+f.image_pane_height+"px",left:"0px",height:f.filmstrip_height+"px",width:"100%","overflow-x":"scroll","white-space":"nowrap",display:"inline-block","background-color":"black"},f.filmstripPanelImageHeight={height:f.image_height+"px"}};f.smallImages=[],f.largeImageMap={},f.styleMap={},f.largeImageById=[],angular.forEach(f.data.large_images,function(a){var b=a.split("_");f.largeImageMap[b[1]]=f.data.source+"/images/"+f.data.item_id+"/large/"+a,f.styleMap[b[1]]="",f.largeImageById.push(b[1])}),angular.forEach(f.data.small_images,function(a){f.smallImages.push({id:a.split("_")[1],src:f.data.source+"/images/"+f.data.item_id+"/small/"+a})}),f.loadImage=function(a){f.styleMap[f.current]="",f.styleMap[a]="highlight-current",f.image=f.largeImageMap[a],f.current=a,f.displaying=f.largeImageById.indexOf(f.current)+1+" of "+f.largeImageById.length;var d=b.hash();b.hash(a),c(),b.hash(d),0==f.largeImageById.indexOf(f.current)?(f.showNext=!0,f.showPrevious=!1):f.largeImageById.indexOf(f.current)==f.largeImageById.length-1?(f.showNext=!1,f.showPrevious=!0):(f.showNext=!0,f.showPrevious=!0)},h();var i=f.data.large_images[0];f.current=i.split("_")[1],f.loadImage(f.current),d(function(){f.show=!0},50),f.next=function(){var a=f.largeImageById.indexOf(f.current);if(a<f.largeImageById.length-1){var b=f.largeImageById[a+1];f.loadImage(b)}},f.previous=function(){var a=f.largeImageById.indexOf(f.current);if(a>0){var b=f.largeImageById[a-1];f.loadImage(b)}},f.jumpToStart=function(){var a=f.largeImageById[0];f.loadImage(a)},f.jumpToEnd=function(){var a=f.largeImageById[f.largeImageById.length-1];f.loadImage(a)},f.toggleFilmstrip=function(){f.showFilmstrip=!f.showFilmstrip,h()},f.toggleInformation=function(){f.showInformation=!f.showInformation}}}}]),angular.module("searchApp").directive("smoothzoom",["$window","$timeout",function(){return{template:"",restrict:"A",link:function(a,b){a.init=function(){b.smoothZoom({animation_SPEED_ZOOM:.5,animation_SPEED_PAN:.5,animation_SMOOTHNESS:5,zoom_MAX:400,background_COLOR:"black",button_ALIGN:"top right",button_AUTO_HIDE:!0,button_SIZE:26,responsive:!0})},a.$watch("image_pane_height",function(){b.smoothZoom("destroy"),a.init()}),b.on("load",function(){a.init()})}}}]),angular.module("searchApp").directive("gridView",["SolrService","ImageService","$window",function(a,b,c){return{templateUrl:"views/grid-view.html",restrict:"E",scope:{},link:function(d){c.innerWidth<1e3?d.rowCount=3:c.innerWidth>1e3&&(d.rowCount=4),d.isImage=!1;var e=function(){d.docs=[],d.results=a.results.docs;for(var c=0;c<d.results.length;c+=d.rowCount){var e=[];d.results.sequenceNo=c;for(var f=0;f<d.rowCount;f++)void 0!==d.results[c+f]&&(d.results[c+f].isImage=b.isImage(d.results[c+f].fullsize)?!0:!1,e.push(d.results[c+f]));d.docs.push(e)}};e(),d.$on("search-results-updated",function(){e()}),d.view=function(a){a.isImage?b.push(a):c.location=a.fullsize}}}}]),angular.module("searchApp").filter("valueOrDash",function(){return function(a){return void 0===a?"-":a}}),angular.module("searchApp").directive("dateRangeWidget",["SolrService",function(a){return{templateUrl:"views/date-range-widget.html",restrict:"E",scope:{dateStart:"@",dateEnd:"@"},link:function(b){var c=new Date;b.ds=parseInt(b.dateStart),b.de=parseInt(void 0===b.dateEnd?c.getFullYear():angular.fromJson(b.dateEnd)),b.start=b.ds,b.end=b.de,b.$on("reset-all-filters",function(){b.ds=b.start,b.de=b.end}),b.updateResultSet=function(){isNaN(b.ds)&&(b.ds=b.start),isNaN(b.de)&&(b.de=b.end),b.ds>b.de&&(b.ds=b.de-1),b.de<b.ds&&(b.de=b.ds+1),a.filterDateQuery(null,b.ds,b.de,b.ds+" - "+b.de)}}}}]);