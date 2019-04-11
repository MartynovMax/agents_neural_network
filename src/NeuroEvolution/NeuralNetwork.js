/* eslint-disable */
import * as tf from '@tensorflow/tfjs';



/** Simple Neural Network library that can only create neural networks of exactly 3 layers */
export default class NeuralNetwork {

  /**
   * Takes in the number of input nodes, hidden node and output nodes
   * @constructor
   * @param {number} input_nodes
   * @param {number} hidden_nodes
   * @param {number} output_nodes
   */
  constructor (input_nodes, hidden_nodes, output_nodes) {

    this.input_nodes = input_nodes;
    this.hidden_nodes = hidden_nodes;
    this.output_nodes = output_nodes;

    // Initialize random weights
    this.input_weights = tf.randomNormal([this.input_nodes, this.hidden_nodes]);
    this.output_weights = tf.randomNormal([this.hidden_nodes, this.output_nodes]);


    // const model = tf.sequential();
    // model.add(tf.layers.inputLayer({ inputShape: [this.input_nodes] }));
    // model.add(tf.layers.dense({ units: this.hidden_nodes, activation: 'relu' }));
    // model.add(tf.layers.dense({ units: this.output_nodes, activation: 'sigmoid' }));
    // model.compile({
    //   optimizer: tf.train.adam(1e-6),
    //   loss: tf.losses.sigmoidCrossEntropy,
    //   metrics: ['accuracy']
    // });


    // const model = tf.sequential();
    // // model.add(tf.layers.dense({inputShape: [3],  units: 10, activation: 'sigmoid',}) );  // 3 inputs to 10 hidden layer nodes
    // // model.add(tf.layers.dense({inputShape: [10], units: 2,  activation: 'sigmoid',}) );  // from the 10 hidden layer nodes to 2 output layers
    // model.add(tf.layers.dense({inputShape: [3],  units: 10, activation: 'tanh',}) );  // 3 inputs to 10 hidden layer nodes
    // model.add(tf.layers.dense({inputShape: [10], units: 2,  activation: 'tanh',}) );  // from the 10 hidden layer nodes to 2 output layers
    // const myOptimizer = tf.train.sgd(0.5);
    // model.compile({optimizer: myOptimizer, loss: 'meanSquaredError'});

    // this.model = model

    this.isFitProcess = false
  }


  // loss (predictions, labels) {
  //   return predictions.sub(labels).square().mean()
  // }



  // train (user_input) {
  //     const errors = []
  //     optimizer.minimize(() => {
  //         const predsYs = this.predict(user_input);
  //         const e = this.loss(predsYs, ysNorm);
  //         errors.push(e.dataSync())
  //         return e
  //     });

  //     const learningRate = 0.5;
  //     const optimizer = tf.train.sgd(learningRate);
  // }







  /**
   * Takes in a 1D array and feed forwards through the network
   * @param {array} - Array of inputs
   */
  predict(user_input) {
    let output;
    tf.tidy(() => {
      /* Takes a 1D array */
      let input_layer = tf.tensor(user_input, [1, this.input_nodes]);

      // TODO: .tanh() or .elu()? What is the diff, because it looks like the
      // both do the same thing (output [-1; 1])
      // @see https://en.wikipedia.org/wiki/Activation_function#Comparison_of_activation_functions

      let hidden_layer = input_layer.matMul(this.input_weights).sigmoid();
      // let hidden_layer = input_layer.matMul(this.input_weights).relu();
      // let hidden_layer = input_layer.matMul(this.input_weights).elu();
      // let hidden_layer = input_layer.matMul(this.input_weights).tanh();

      let output_layer = hidden_layer.matMul(this.output_weights).elu();
      // let output_layer = hidden_layer.matMul(this.output_weights).tanh();
      output = output_layer.dataSync();
    });
    return output;
  }

  // predict(user_input) {
  //   let output;
  //   tf.tidy(() => {
  //     /* Takes a 1D array */
  //     let input_layer = tf.tensor(user_input, [1, this.input_nodes]);

  //     // let hidden_layer = input_layer.matMul(this.input_weights).tanh();
  //     // let output_layer = hidden_layer.matMul(this.output_weights).tanh();

  //     // or

  //     let hidden_layer = tf.tanh(input_layer.matMul(this.input_weights));
  //     let output_layer = tf.tanh(hidden_layer.matMul(this.output_weights));
  //     output = output_layer.dataSync();
  //   });
  //   return output;
  // }

  // async predict(user_input) {
  //   const inputData = tf.tensor2d([user_input]);

  //   // TODO: this is not correct!
  //   // We should calculate necessary impulses values for each input value
  //   const goalData = tf.tensor2d([[
  //     0.005,
  //     Math.sign(user_input[1]) * 0.001
  //   ]]);

  //   if (!this.isFitProcess) {
  //     this.isFitProcess = true

  //     await this.model.fit(inputData, goalData, {
  //       batchSize: 1,
  //       epochs: 1,
  //       callbacks:  {
  //         onEpochEnd: (epoch, logs) => {
  //           // console.log('loss: ', logs.loss)
  //           this.isFitProcess = false
  //         }
  //       }
  //     })
  //   }

  //   let output = this.model.predict(inputData).data()
  //   return output;
  // }

  /**
   * Returns a new network with the same weights as this Neural Network
   * @returns {NeuralNetwork}
   */
  clone() {
    let clonie = new NeuralNetwork(this.input_nodes, this.hidden_nodes, this.output_nodes);
    clonie.dispose();
    clonie.input_weights = tf.clone(this.input_weights);
    clonie.output_weights = tf.clone(this.output_weights);
    return clonie;
  }

  /**
   * Dispose the input and output weights from the memory
   */
  dispose() {
    this.input_weights.dispose();
    this.output_weights.dispose();
  }
}
