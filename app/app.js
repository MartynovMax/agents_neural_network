(function(){
  'use strict';

  angular.module('AngularApp', []);

  angular.module('AngularApp').constant('APP_VERSION', '0.0.0');


  angular.module('AngularApp').run(run);

  run.$inject = ['$rootScope', '$timeout'];
  function run($rootScope, $timeout){
    // it will be a function after canvas directive init  
    $rootScope.handlers               = {};
    $rootScope.handlers.getGroups     = undefined;
    $rootScope.handlers.export        = undefined;
    $rootScope.handlers.newPopulation = undefined;

    $rootScope.getGroups             = getGroups;
    $rootScope.exportBrainFirstAgent = exportBrainFirstAgent;
    $rootScope.exportBestBrain       = exportBestBrain;

    return this;



    function getGroups() {
      var groups = $rootScope.handlers.getGroups();
      console.table(groups);
    }


    function exportBrainFirstAgent() {
      var groups = $rootScope.handlers.getGroups();
      var group  = groups[0];
      var json   = group.getBrainJSON(); 
      log(json);
      log(JSON.stringify(json));
    }


    function exportBestBrain() {
      var groups = $rootScope.handlers.getGroups();
      groups.sort(function(a, b) {
        return b.score - a.score;
      });
      var bestGroup = groups[0];
      var json = bestGroup.getBrainJSON();
      log(json);
      log(JSON.stringify(json));
    }
  }

})();
