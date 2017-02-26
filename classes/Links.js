define(function (require) {
  'use strict';

  // constructor
  function Links() {
    this.links = {};
    this.totalLinksCount = 0;
  }

  var _class = Links;

  _class.prototype.getReceivers  = getReceivers;
  // _class.prototype.getWeight     = getWeight;
  // _class.prototype.addWeight     = addWeight;
  // _class.prototype.getAllWeights = getAllWeights;
  // _class.prototype.setAllWeights = setAllWeights;
  // _class.prototype.clone         = clone;

  return _class;


  function getReceivers(activatorNeuronNumber) {
    var ret = null;

    if (this.links[activatorNeuronNumber]) {
      ret = Object.keys(this.links[activatorNeuronNumber]);
    } else {
      ret = [];
    }
    return ret;
  }


  function getWeight(activatorNeuronNumber, receiverNeuronNumber) {
    var weight = 0;

    if (this.links[activatorNeuronNumber]) {
      var receiverNumToWeight = this.links[activatorNeuronNumber];

      if (receiverNumToWeight[receiverNeuronNumber]) {
        weight = receiverNumToWeight[receiverNeuronNumber];
      } else {
        throw new Error('getWeight 1');
      }
    } else {
      throw new Error('getWeight 2');
    }
    return weight;
  }


});
