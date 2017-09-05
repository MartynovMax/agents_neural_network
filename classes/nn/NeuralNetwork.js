define(function (require) {
  'use strict';

  var ThresholdFunction = require('nn/ThresholdFunction');
  var Links             = require('nn/Links');
  var Neuron            = require('nn/Neuron');

  // constructor
  function NeuralNetwork(json) {
    var self = this;

    this.perceptron           = undefined;
    this.json                 = json;
    // this.neurons              = [];
    // this.neuronsLinks         = new Links();
    // this.activationIterations = 1;

    this.createPerceptron();
  }


  var _class = NeuralNetwork;

  _class.prototype.DEFAULT = {
    LEARNING_RATE: 0.5,
  };


  _class.prototype.createPerceptron         = createPerceptron;
  _class.prototype.getNeuronsCount          = getNeuronsCount;
  _class.prototype.putSignalToNeuron        = putSignalToNeuron;
  _class.prototype.getAfterActivationSignal = getAfterActivationSignal;
  _class.prototype.activate                 = activate;
  _class.prototype.toJSON                   = toJSON;
  _class.prototype.fromJSON                 = fromJSON;

  return _class;




  // function createPerceptron() {
  //   var numberOfNeurons = 3;

  //   for (var i = 0; i < numberOfNeurons; i++) {
  //     this.neurons.push(
  //       new Neuron(ThresholdFunction.SIGN, ThresholdFunction.SIGN.getDefaultParams())
  //     );
  //   }
  // }




  // function activate() {
  //   for (var iter = 0; iter < this.activationIterations; iter++) {
  //     for (var i = 0; i < this.neurons.length; i++) {
  //       var activator = this.neurons[i];
  //       activator.activate();
  //       var activatorSignal = activator.getAfterActivationSignal();

  //       var receivers = this.neuronsLinks.getReceivers(i);

  //       for (var r=0; r < receivers.length; r++) {
  //         if (r >= this.neurons.length) {
  //           throw new Error("Neural network has " + this.neurons.length
  //               + " neurons. But there was trying to accsess neuron with index " + r);
  //         }

  //         var receiver = this.neurons[r];
  //         var weight   = this.neuronsLinks.getWeight(i, r);
  //         receiver.addSignal(activatorSignal * weight);
  //       }
  //     }
  //   }
  // }



  function getNeuronsCount() {
    return this.neurons.length;
  }


  function putSignalToNeuron(neuronIndx, signalValue) {
    if (neuronIndx < this.neurons.length) {
      this.neurons[neuronIndx].addSignal(signalValue);
    } else {
      throw new Error('Could not put signal to network');
    }
  }


  function getAfterActivationSignal(neuronIndx) {
    if (neuronIndx < this.neurons.length) {
      return this.neurons[neuronIndx].getAfterActivationSignal();
    } else {
      throw new Error('Could not get after activation signal');
    }
  }
  



  function createPerceptron() {
    // this.json = {"neurons":[{"trace":{"elegibility":{},"extended":{}},"state":0,"old":0,"activation":1,"bias":0,"layer":"input","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":0,"old":0,"activation":-0.00027170671952892654,"bias":0,"layer":"input","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":0,"old":0,"activation":0.004737783729736009,"bias":0,"layer":"input","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":-0.12268427822799942,"old":-0.12116351595715118,"activation":-0.12207243690393085,"bias":-0.046403829777385,"layer":"0","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":-0.3590986496954507,"old":-0.3597803832095136,"activation":-0.3444198533056166,"bias":-0.27003353772741717,"layer":"0","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":0.3382676973418737,"old":0.33799588121175395,"activation":0.3259299905102024,"bias":0.2207074863330005,"layer":"0","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":-0.1883343850426549,"old":-0.18846943945098352,"activation":-0.18613880039936884,"bias":-0.0783742941182061,"layer":"0","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":-0.00011041427842758966,"old":-0.0016228615451147968,"activation":-0.00011041427797883497,"bias":0.08033566126294965,"layer":"output","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":0.30949703259473116,"old":0.3095065733480981,"activation":0.29997945969728884,"bias":0.2931252965930137,"layer":"output","squash":"TANH"}],"connections":[{"from":"0","to":"3","weight":-0.07666681123195496,"gater":null},{"from":"0","to":"4","weight":-0.08884474371081531,"gater":null},{"from":"0","to":"5","weight":0.11797006409525947,"gater":null},{"from":"0","to":"6","weight":-0.11029151230113199,"gater":null},{"from":"1","to":"3","weight":-0.9816106844032242,"gater":null},{"from":"1","to":"4","weight":0.4171979303945384,"gater":null},{"from":"1","to":"5","weight":-0.07503742552919357,"gater":null},{"from":"1","to":"6","weight":0.35769658665241094,"gater":null},{"from":"2","to":"3","weight":0.05249990401784175,"gater":null},{"from":"2","to":"4","weight":-0.03248281152253648,"gater":null},{"from":"2","to":"5","weight":-0.08907010871837814,"gater":null},{"from":"2","to":"6","weight":0.08171360179694846,"gater":null},{"from":"3","to":"7","weight":-0.8101559061493889,"gater":null},{"from":"3","to":"8","weight":0.01751408028844222,"gater":null},{"from":"4","to":"7","weight":0.3257775901810153,"gater":null},{"from":"4","to":"8","weight":-0.03153919141886349,"gater":null},{"from":"5","to":"7","weight":-0.048161146013775157,"gater":null},{"from":"5","to":"8","weight":0.07099928124804758,"gater":null},{"from":"6","to":"7","weight":0.2769176840502098,"gater":null},{"from":"6","to":"8","weight":0.08316754980671962,"gater":null}]};

    if (this.json) {
      this.perceptron = synaptic.Network.fromJSON(this.json);
    } else {
      // this.perceptron = new synaptic.Architect.Perceptron(3, 4, 2);
      
      var inputLayer  = new synaptic.Layer(3),
          hiddenLayer = new synaptic.Layer(4),
          outputLayer = new synaptic.Layer(2);

      inputLayer.project(hiddenLayer, synaptic.Layer.connectionType.ALL_TO_ALL);
      hiddenLayer.project(outputLayer, synaptic.Layer.connectionType.ALL_TO_ALL);

      this.perceptron = new synaptic.Network({
        input: inputLayer,
        hidden: [hiddenLayer],
        output: outputLayer
      });


      // set TANH. It is used to work with values [-1, 1]
      var squash = synaptic.Neuron.squash.TANH;

      this.perceptron.layers.input.set({squash: squash});
      this.perceptron.layers.hidden.forEach(function(layer){
        layer.set({squash: squash})
      });
      this.perceptron.layers.output.set({squash: squash});
    }   
  }



  function activate(dataObj) {
    var result = this.perceptron.activate([
      dataObj.isSeeFood,
      dataObj.angleToFood,
      dataObj.distanceToFood,
      // dataObj.satiety,
    ]);


    // this.perceptron.propagate(
    //   this.DEFAULT.LEARNING_RATE, 
    //   [
    //     dataObj.angleToFood,
    //     0.3,
    //   ]
    // );

    return {
      angle: result[0],    
      speed: result[1], 
    }
  }


  // TODO: correct me
  function toJSON() {
    return this.perceptron.toJSON();
  }


  // TODO: validate me
  function fromJSON(json) {
    this.perceptron = synaptic.Network.fromJSON(json);
  }

});
