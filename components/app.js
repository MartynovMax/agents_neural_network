(function(){
  'use strict';

  angular.module('AngularApp', []);

  angular.module('AngularApp').constant('APP_VERSION', '0.0.0');


  angular.module('AngularApp').run(run);

  run.$inject = ['$rootScope'];
  function run($rootScope){}

})();
