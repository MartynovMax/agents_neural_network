define(function (require) {
  'use strict';

  var NeuralNetwork = require('nn/NeuralNetwork');

    
  // constructor
  function Group(canvas, entities, params, brain) {
    var self = this;
    if (!params) params = {};

    this.id        = _generateUID();
    this._canvas   = canvas;
    this._entities = entities || [];
    this.brain     = undefined;

    if (brain) {
      this.setBrain(brain);
    } else {
      this.setBrain(new NeuralNetwork());
    }

    this._canvas.addEl(this);
  }


  var _class = Group;

  _class.prototype.DEFAULT = {
    params: {
      isAllowMove: true,
    },
  };


  _class.prototype.add        = add;
  _class.prototype.remove     = remove;
  _class.prototype.isContains = isContains;
  _class.prototype.length     = length;
  _class.prototype.destroy    = destroy;
  _class.prototype.setBrain   = setBrain;

  return _class;




  // TODO: handle errors
  function add(item) {
    if (!item || !item.id) return undefined;
    if (this.isContains(item.id)) return undefined;
    this._entities.push(item); 
  }


  
  function remove(itemID) {
    if (!itemID) return undefined;

    for (var i=0; i < this._entities.length; i++) {
      if (this._entities[i] && this._entities[i].id === itemID) {
        this._entities.splice(i, 0);
      }
    }
  }



  function length() {
    return this._entities.length;
  }



  function isContains(itemID) {
    if (!itemID) return false;

    for (var i=0; i < this._entities.length; i++) {
      if (this._entities[i] && this._entities[i].id === itemID) {
        return true;
      }
    } 
    return false;
  }



  function setBrain(neuralNetwork){
    if ( !(neuralNetwork instanceof NeuralNetwork) ) {
      throw Error('Incorrect instance');
    }
    this.brain = neuralNetwork;
  }



  function destroy() {
    log('Group destroy');
  }


});
