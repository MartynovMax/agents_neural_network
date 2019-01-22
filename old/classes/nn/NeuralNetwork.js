define(function (require) {
  'use strict';

  var ThresholdFunction = require('nn/ThresholdFunction');
  var Links             = require('nn/Links');
  var Neuron            = require('nn/Neuron');

  // constructor
  function NeuralNetwork() {
    var self = this;

    this.perceptron           = undefined;
    // this.neurons              = [];
    // this.neuronsLinks         = new Links();
    // this.activationIterations = 1;

    this.createPerceptron();
  }


  var _class = NeuralNetwork;

  _class.prototype.DEFAULT = {
    LEARNING_RATE: 0.3,
  };


  _class.prototype.createPerceptron         = createPerceptron;
  _class.prototype.activate                 = activate;
  _class.prototype.toJSON                   = toJSON;

  return _class;



  function createPerceptron() {
    this.perceptron = new window.neataptic.architect.Perceptron(3, 4, 2);
  }




  function activate(dataObj) {
    var result = this.perceptron.activate([
      dataObj.isSeeFood,
      dataObj.angleToFood,
      dataObj.distanceToFood,
    ]);


    console.log('result', result);

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
    log(JSON.stringify(this.perceptron.toJSON()) )
    return this.perceptron.toJSON();
  }

});
