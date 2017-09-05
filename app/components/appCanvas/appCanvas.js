(function(){
  'use strict';


  /*
    <app-canvas></app-canvas> 
  */
  angular.module('AngularApp')
    .component('appCanvas', {
      bindings: {
      handlerGetGroups     : '=',
      handlerExport        : '=',
      handlerNewPopulation : '=',
      },
      controller: AppCanvasCtrl,
    });



  AppCanvasCtrl.$inject = ['$element', '$timeout'];

  function AppCanvasCtrl($element, $timeout) {
    var self = this;

    this.canvas = undefined;

    this.init         = init;
    this.exampleTrain = exampleTrain;
    this.createCanvas = createCanvas;
    this.getGroups    = getGroups;
    this.export       = _export;
    this.generateNextPopulation = generateNextPopulation;
    
    this.init();


    // this.exampleTrain();
    return this;


    function init() {
      $timeout(function(){
        this.handlerGetGroups     = this.getGroups;
        this.handlerExport        = this.export;
        this.handlerNewPopulation = this.generateNextPopulation;
      }.bind(this));

      // _initOneAgent();
      _initMultipleGroups();
      // _initOneGroup();
    } 



    function getGroups() {
      var groups = self.canvas.getGroups();
      return groups;
    }



    function generateNextPopulation() {
      self.canvas.generateNextPopulation();
    }



    function _export(type, options) {
      return self.canvas.export(type, options);
    }



    function createCanvas(data) {
      requirejs(["Canvas"], function(Canvas) {
        self.canvas = new Canvas(
          $element[0], 
          {
            map: {
              params: {
                isRandomWalls: false,
                entities: data,
              },
            },
          }, 
          'edit'
        );
      });
    }



    function _initOneAgent() {
      var countGroups = 1;
      var countAgents = 1;
      var countFoods  = 1;
      var groups      = [];
      var foods       = [];

      for (var g=0; g < countGroups; g++) {
        groups[g]        = {};
        groups[g].params = {};
        groups[g].params.entityClass = 'Agent';
        groups[g].params.entities    = [];

        for (var a=0; a < countAgents; a++) {
          groups[g].params.entities.push({
            attrs: {
              x     : 100,
              y     : 200,
              angle : 90,
              speed : 0,
            },
          });
        }
      }

      for (var f = countFoods; f >= 1; f--) {
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
      }

      self.createCanvas({Group: groups, Food: foods});
    }



    function _initMultipleGroups() {
      // window.masterBrain = {"neurons":[{"trace":{"elegibility":{},"extended":{}},"state":0,"old":0,"activation":0,"bias":0,"layer":"input","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":0,"old":0,"activation":0,"bias":0,"layer":"input","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":0,"old":0,"activation":0,"bias":0,"layer":"input","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":1.5406035469577046,"old":1.5406035469577046,"activation":0.9122217312721989,"bias":1.5406035469577046,"layer":"0","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":0.1476468127778035,"old":0.1476468127778035,"activation":0.14658320671528588,"bias":0.1476468127778035,"layer":"0","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":-0.17033397114642265,"old":-0.17033397114642265,"activation":-0.16870552994907692,"bias":-0.17033397114642265,"layer":"0","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":2.0020351591035563,"old":2.0020351591035563,"activation":0.9641710839996133,"bias":2.0020351591035563,"layer":"0","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":2.486326882515961,"old":2.486326882515961,"activation":0.9862457507397622,"bias":-0.22475273650621755,"layer":"output","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":9.537355402705133,"old":9.537355402705133,"activation":0.9999999896010774,"bias":-1.0974740706655908,"layer":"output","squash":"TANH"}],"connections":[{"from":"0","to":"3","weight":-1.3706762193713025,"gater":null},{"from":"0","to":"4","weight":-3.6049056902861505,"gater":null},{"from":"0","to":"5","weight":0.04375525773424585,"gater":null},{"from":"0","to":"6","weight":0.4539756527553718,"gater":null},{"from":"1","to":"3","weight":1.986242295864027,"gater":null},{"from":"1","to":"4","weight":0.7813669573154095,"gater":null},{"from":"1","to":"5","weight":-0.35369371514224196,"gater":null},{"from":"1","to":"6","weight":-0.37273185724225255,"gater":null},{"from":"2","to":"3","weight":-0.6984785532270972,"gater":null},{"from":"2","to":"4","weight":0.07685139682199676,"gater":null},{"from":"2","to":"5","weight":1.1764106662735594,"gater":null},{"from":"2","to":"6","weight":0.40818100098119603,"gater":null},{"from":"3","to":"7","weight":1.8380202950665567,"gater":null},{"from":"3","to":"8","weight":9.652480794370847,"gater":null},{"from":"4","to":"7","weight":-4.520018945548588,"gater":null},{"from":"4","to":"8","weight":-2.8193621479059585,"gater":null},{"from":"5","to":"7","weight":-5.776511981593543,"gater":null},{"from":"5","to":"8","weight":-0.9611076142853413,"gater":null},{"from":"6","to":"7","weight":0.7492725426765052,"gater":null},{"from":"6","to":"8","weight":2.158075202330571,"gater":null}]};

      var countGroups = 8;
      var countAgents = 1;
      var countFoods  = countGroups * countAgents + 5;
      var groups      = [];
      var foods       = [];

      for (var g=0; g < countGroups; g++) {
        groups[g]        = {};
        groups[g].params = {};
        groups[g].params.entityClass = 'Agent';
        groups[g].params.entities    = [];

        for (var a=0; a < countAgents; a++) {
          groups[g].params.entities.push({});
        }
      }

      for (var f = countFoods; f >= 1; f--) {
        foods.push({
          attrs: {
            speed : 1,
          },
          params: {
            isAllowMove: false,
          },
        });
      }

      self.createCanvas({Group: groups, Food: foods});
    }



    function _initOneGroup() {
      var countGroups = 1;
      var countAgents = 5;
      var countFoods  = countGroups * countAgents;
      var groups      = [];
      var foods       = [];

      for (var g=0; g < countGroups; g++) {
        groups[g]        = {};
        groups[g].params = {};
        groups[g].params.entityClass = 'Agent';
        groups[g].params.entities    = [];

        for (var a=0; a < countAgents; a++) {
          groups[g].params.entities.push({});
        }
      }

      for (var f = countFoods; f >= 1; f--) {
        foods.push({
          attrs: {
            speed : 1,
          },
          params: {
            isAllowMove: false,
          },
        });
      }

      self.createCanvas({Group: groups, Food: foods});
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
