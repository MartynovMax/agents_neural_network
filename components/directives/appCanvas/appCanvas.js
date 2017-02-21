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
      var numberAgents = 1;
      var agents = [];
      var foods  = [];

      for (var i = numberAgents; i >= 1; i--) {
        agents.push({
          x: 400 * i + 50,
          y: 150 * i + 50,
        });
      }

      for (var i = 1; i >= 1; i--) {
        foods.push({
          x: 800 * Math.random(),
          y: 400 * Math.random(),
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
