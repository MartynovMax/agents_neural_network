(function(_window){
  'use strict';
  _window.NeuralNetwork = NeuralNetwork;


  function NeuralNetwork() {
    var self = this;

    this.perceptron = undefined;

    this.createPerceptron();
  }


  var _class = NeuralNetwork;

  _class.prototype.DEFAULT = {
    LEARNING_RATE: 0.3,
  };


  _class.prototype.createPerceptron = createPerceptron;
  _class.prototype.activate = activate;
  _class.prototype.toJSON   = toJSON;




  function createPerceptron() {
    var _json = undefined;
    // _json = {"neurons":[{"trace":{"elegibility":{},"extended":{}},"state":0,"old":0,"activation":0.9999825629428609,"bias":0,"layer":"input","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":-0.28854853766445016,"old":-0.28837859138589145,"activation":-0.2807983404546232,"bias":-0.13030046597371941,"layer":"0","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":-0.3939764506616217,"old":-0.39375601862367754,"activation":-0.3747832197560146,"bias":-0.2201185796423566,"layer":"0","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":0.04949431429761766,"old":0.04947949026951959,"activation":0.04945393866501561,"bias":0.07666185961346911,"layer":"0","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":0.1007890202117883,"old":0.10073771033555975,"activation":0.10044911534996592,"bias":0.07095708339607634,"layer":"0","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":-1.0431137824105994,"old":-1.0428297079690945,"activation":-0.7791146935302308,"bias":-0.9226242706268116,"layer":"1","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":0.9736213396760148,"old":0.9733378491248477,"activation":0.7502913453743446,"bias":0.8665799590453531,"layer":"1","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":0.31796640236521356,"old":0.3178123138475433,"activation":0.30766697556769523,"bias":0.2788266182397696,"layer":"1","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":-0.6913960784700851,"old":-0.6911571302666822,"activation":-0.5988781170902829,"bias":-0.6645240968751867,"layer":"1","squash":"TANH"},{"trace":{"elegibility":{},"extended":{}},"state":3.794083571523058,"old":3.7923946346185833,"activation":0.9989876958832946,"bias":2.116195522263381,"layer":"output","squash":"TANH"}],"connections":[{"from":"0","to":"1","weight":-0.15842893755740767,"gater":null},{"from":"0","to":"2","weight":-0.17411410039571773,"gater":null},{"from":"0","to":"3","weight":-0.027123452294055866,"gater":null},{"from":"0","to":"4","weight":0.02989896343724919,"gater":null},{"from":"1","to":"5","weight":0.08738576816300705,"gater":null},{"from":"1","to":"6","weight":-0.1230046119480323,"gater":null},{"from":"1","to":"7","weight":-0.060198743786420164,"gater":null},{"from":"1","to":"8","weight":0.06387173814696255,"gater":null},{"from":"2","to":"5","weight":0.21953579719217464,"gater":null},{"from":"2","to":"6","weight":-0.20153254076705754,"gater":null},{"from":"2","to":"7","weight":-0.03136235764879433,"gater":null},{"from":"2","to":"8","weight":0.033399724832565494,"gater":null},{"from":"3","to":"5","weight":-0.032099291447006434,"gater":null},{"from":"3","to":"6","weight":0.027660295805426338,"gater":null},{"from":"3","to":"7","weight":0.02402943166864391,"gater":null},{"from":"3","to":"8","weight":0.0022863948483260745,"gater":null},{"from":"4","to":"5","weight":-0.12409148513118548,"gater":null},{"from":"4","to":"6","weight":-0.03990539546687196,"gater":null},{"from":"4","to":"7","weight":0.0947917293049411,"gater":null},{"from":"4","to":"8","weight":0.030710906034670044,"gater":null},{"from":"5","to":"9","weight":-0.8741950880545104,"gater":null},{"from":"6","to":"9","weight":0.806056546058651,"gater":null},{"from":"7","to":"9","weight":0.22843190043919664,"gater":null},{"from":"8","to":"9","weight":-0.5411458937792852,"gater":null}]};

    if (_json) {
      this.perceptron = synaptic.Network.fromJSON(_json);
    } else {
      this.perceptron = new synaptic.Architect.Perceptron(3, 4, 2);


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
    ]);


    this.perceptron.propagate(
      this.DEFAULT.LEARNING_RATE, 
      [
        dataObj.angleToFood,
        0.5,
      ]
    );

    return {
      angle: result[0],    
      speed: result[1], 
    }
  }



  function toJSON() {
    log(JSON.stringify(this.perceptron.toJSON()) )
    return this.perceptron.toJSON();
  }

})(window);
