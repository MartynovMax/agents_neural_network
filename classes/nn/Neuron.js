define(function (require) {
  'use strict';

  // constructor
  function Neuron(thresholdFunction, params) {
    this.inputSignal           = undefined;
    this.afterActivationSignal = undefined;
    this.thresholdFunction     = undefined;
    this.params                = undefined; // []

    this.setFunctionAndParams(thresholdFunction, params);
  }

  var _class = Neuron;

  // _class.prototype.getReceivers  = getReceivers;
  _class.prototype.addSignal                = addSignal;
  _class.prototype.setFunctionAndParams     = setFunctionAndParams;
  _class.prototype.activate                 = activate;
  _class.prototype.getAfterActivationSignal = getAfterActivationSignal;

  return _class;



  function setFunctionAndParams(func, paramsArr) {
    if (paramsArr.length != func.getDefaultParams().length) {
      throw new Error("Function needs " + func.getDefaultParams().length
          + " parameters. But params count is " + paramsArr.length);
    }
    this.thresholdFunction = func;
    this.params = paramsArr;
  }


  function activate() {
    this.afterActivationSignal = this.thresholdFunction.calculate(this.inputSignal, this.params);
    this.inputSignal = 0;
  }


  function addSignal(value) {
    this.inputSignal += value;
  }


  function getAfterActivationSignal() {
    return this.afterActivationSignal;
  }

});
