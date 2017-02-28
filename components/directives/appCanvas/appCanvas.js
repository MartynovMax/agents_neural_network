(function(){
  'use strict';


  /*
    <app-canvas></app-canvas> 
  */
  angular.module('AngularApp')
    .directive('appCanvas', appCanvas)
    .controller('AppCanvasCtrl', AppCanvasCtrl);


  function appCanvas() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        handlerGetGroups: '=',
        handlerExport: '=',
      },
      controller: 'AppCanvasCtrl',
      controllerAs: 'ctrl',
    };
  };



  AppCanvasCtrl.$inject = ['$scope', '$element'];

  function AppCanvasCtrl($scope, $element) {
    var self = this;

    this.canvas = undefined;

    this.init = init;
    this.exampleTrain = exampleTrain;
    this.createCanvas = createCanvas;
    this.getGroups    = getGroups;
    this.export       = _export;

    $scope.handlerGetGroups = this.getGroups;
    $scope.handlerExport    = this.export;
    
    this.init();


    // this.exampleTrain();
    return this;


    function init() {
      // _initOneAgent();
      // _initMultipleAgents();
    } 



    function getGroups() {
      var groups = self.canvas.getGroups();
      return groups;
    }



    function _export(type, options) {
      return self.canvas.export(type, options);
    }



    function createCanvas(data) {
      requirejs(["Canvas"], function(Canvas) {
        self.canvas = new Canvas($element[0], data, 'edit');
      });
    }



    function _initOneAgent() {
      var numberAgents = 1;
      var numberFoods  = 1;
      var agents = [];
      var foods  = [];

      agents.push({
        attrs: {
          x     : 100,
          y     : 200,
          angle : 90,
          speed : 0,
        },
      });

      foods.push({
        attrs: {
          x     : 200,
          y     : 200,
          angle : 90,
          speed : 1,
        },
        params: {
          isAllowMove: true,
        }
      });

      self.createCanvas({agents: agents, foods: foods});
    }




    function _initMultipleAgents() {
      var countGroups = 3;
      var countAgents = 3;
      var countFoods  = countGroups * countAgents;
      var groups      = [];
      var foods       = [];

      for (var g=0; g < countGroups; g++) {
        groups[g]        = {};
        groups[g].agents = [];

        for (var a=0; a < countAgents; a++) {
          groups[g].agents.push({
            attrs: {},
          });
        }
      }

      for (var f = countFoods; f >= 1; f--) {
        foods.push({
          attrs: {
            speed : 1
          }
        });
      }

      self.createCanvas({groups: groups, foods: foods});
    }



    // TODO: remove me. it is a test function
    function exampleTrain(){
      var perceptron = new synaptic.Architect.Perceptron(2,3,1);
      perceptron.layers.input.set({squash: synaptic.Neuron.squash.TANH});
      perceptron.layers.hidden.forEach(function(layer){
        layer.set({squash: synaptic.Neuron.squash.TANH})
      });
      perceptron.layers.output.set({squash: synaptic.Neuron.squash.TANH});

      var trainer = new synaptic.Trainer(perceptron);

      var trainingSet = [
        {
          input: [1,1],
          output: [1]
        },
        {
          input: [-1,1],
          output: [-1]
        },
        {
          input: [1,-1],
          output: [1]
        },
        {
          input: [-1,-1],
          output: [1]
        },
      ]

      console.time('train');

      trainer.train(trainingSet, {
        rate: .5,
        iterations: 100000,
        error: .1,
        shuffle: true,
        log: 0,
        // cost: synaptic.Trainer.cost.CROSS_ENTROPY
        // cost: synaptic.Trainer.cost.BINARY
        cost: synaptic.Trainer.cost.MSE
      });

      console.timeEnd('train');

      var result = perceptron.activate([-1,1]);

      log('result', result)
      log('perceptron toJSON', perceptron.toJSON())
    }


  }

})();
