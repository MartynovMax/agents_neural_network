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
      scope: {},
      controller: 'AppCanvasCtrl'
    };
  };



  AppCanvasCtrl.$inject = ['$scope', '$element'];

  function AppCanvasCtrl($scope, $element) {

    this.init = init;
    this.exampleTrain = exampleTrain;

    
    this.init();


    // this.exampleTrain();
    return this;


    function init() {
      // _initOneAgent();
      // _initMultipleAgents();
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
          speed : 5,
        }
      });

      foods.push({
        attrs: {
          x     : 600,
          y     : 200,
          angle : 90,
          speed : 1,
        },
        params: {
          isAllowMove: true,
        }
      });

      new Canvas($element[0], {agents: agents, foods: foods}, 'edit');
    }




    function _initMultipleAgents() {
      var numberAgents = 1;
      var numberFoods  = 5;
      var agents = [];
      var foods  = [];

      for (var i = numberAgents; i >= 1; i--) {
        agents.push({
          attrs: {
            x: _randomInteger(100, 600),
            y: _randomInteger(100, 300),
          }
        });
      }

      for (var i = numberFoods; i >= 1; i--) {
        foods.push({
          attrs: {
            x: _randomInteger(100, 600),
            y: _randomInteger(100, 300),
            speed: 1
          }
        });
      }

      new Canvas($element[0], {agents: agents, foods: foods}, 'edit');
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
