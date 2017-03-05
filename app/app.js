(function(){
  'use strict';

  angular.module('AngularApp', []);

  angular.module('AngularApp').constant('APP_VERSION', '0.0.0');


  angular.module('AngularApp').run(run);

  run.$inject = ['$rootScope', '$timeout'];
  function run($rootScope, $timeout){
    // it will be a function after canvas directive init  
    $rootScope.handlers           = {};
    $rootScope.handlers.getGroups = undefined;
    $rootScope.handlers.export    = undefined;

    $rootScope.getGroups = getGroups;

    return this;



    function getGroups() {
      var groups = $rootScope.handlers.getGroups();
      console.table(groups);
    }

  }

})();
