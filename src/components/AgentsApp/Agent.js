/* eslint-disable */
import * as tf from '@tensorflow/tfjs';
import NeuralNetwork from '@/NeuroEvolution/NeuralNetwork'
import { random, randomGaussian } from './random'
import Matter from 'matter-js'


const STATUSES = ['searching', 'see_food']

const MAX_FORCE = 0.005
const MAX_ANGULAR_FORCE = 0.05


export default class Agent {
  constructor (data) {
    this.world = data.world

    this.id = data.id || _generateUID()
    this.type = 'agent'
    this.score = 0
    this.fitness = 0
    this.parents = []
    this.startParams = data || {}

    this._status = STATUSES[0]

    // radians
    this.visionAngle = _toRadians(110)
    this.visionRadius = 70
    this._visionArcPath = []

    // this.colors = []
    this.brain = data.brain || new NeuralNetwork(3, 10, 2)

    this.$body = null

    Object.assign(this, data)

    this.init()
    this.world.addSubject(this)
  }


  get position () {
    if (!this.$body) return Vec2()
    return this.$body.position
  }

  /**
   * @param {Vec2} vec
   */
  set position (vec) {
    if (!this.$body) return
    Matter.Body.setPosition(this.$body, vec)
  }


  get width () {
    return 10
  }
  get height () {
    return this.width
  }


  get angle () {
    if (!this.$body) return -1
    return this.$body.angle
  }

  /**
   * @param {number} angle - in radians
   */
  set angle (val) {
    if (!this.$body) return
    Matter.Body.setAngle(this.$body, val)
  }


  get status () {
    return this._status
  }
  set status (val) {
    if (this._status === val) return
    if (!val || STATUSES.indexOf(val) === -1) {
      this._status = STATUSES[0]
      return
    }

    this._status = val
  }


  init () {
    const position = Vec2(this.startParams.position)

    const rect = Matter.Bodies.circle(
      position.x,
      position.y,
      this.width,
      {
        id: this.id,
        label: this.type,
        frictionAir: 0.01
      }
    );

    this._visionArcPath = _createVisionArcPath(
      0,
      0,
      this.visionRadius,
      _toRadians(360) - this.visionAngle / 2,
      this.visionAngle / 2
    )

    Matter.Body.setMass(rect, 50)

    this.$body = rect;

    this.angle = this.startParams.angle || 0
  }


  draw () {
    const ctx = this.world.canvas.getContext('2d')

    const x = this.position.x
    const y = this.position.y
    let pathArea = this._visionArcPath

    const baseX = pathArea[0].x + x
    const baseY = pathArea[0].y + y

    pathArea = pathArea.map((point) => {
      return _rotatePoint(
        point.x + x,
        point.y + y,
        baseX,
        baseY,
        this.angle
      );
    });

    ctx.beginPath();
    ctx.moveTo(pathArea[0].x, pathArea[0].y);

    for (var i = 1; i < pathArea.length; i++) {
      ctx.lineTo(pathArea[i].x, pathArea[i].y);
    }

    ctx.lineWidth = 1;
    // ctx.strokeStyle = '#5a5a5a';
    ctx.strokeStyle = this.status === 'see_food' ? 'red' : '#5a5a5a';
    ctx.stroke();
  }


  /**
   * @param {number} impulse - [0; 1]
   */
  applyForce (impulse) {
    if (impulse < 0) impulse = 0
    if (impulse > MAX_FORCE) impulse = MAX_FORCE

    Matter.Body.applyForce(this.$body, this.position, {
      x: Math.cos(this.angle) * impulse,
      y: Math.sin(this.angle) * impulse
    });
  }

  /**
   * @param {number} impulse - [-1; 1]
   */
  applyAngularForce (impulse) {
    if (Math.abs(impulse) > MAX_ANGULAR_FORCE) {
      impulse = Math.sign(impulse) * MAX_ANGULAR_FORCE
    }

    Matter.Body.setAngularVelocity(this.$body, impulse);
  }


  getNearFood() {
    const x = this.position.x
    const y = this.position.y
    const resultList = {}

    const foodItems = this.world.getCollectionSubjects('food')

    for (let item of foodItems) {
      if (!item) continue

      // const isPointInRect = _isPointInRect(
      //   item.position,
      //   {
      //     x1: x - this.visionRadius,
      //     y1: y - this.visionRadius,
      //     x2: x + this.visionRadius,
      //     y2: y + this.visionRadius
      //   }
      // )

      // if (!isPointInRect) continue

      const isPointInsideCircleSector = _isPointInsideCircleSector(
        item.position,
        {x, y},
        this.visionRadius,
        this.angle - this.visionAngle / 2,
        this.angle + this.visionAngle / 2
      )

      if (!isPointInsideCircleSector) continue

      const dist = Math.sqrt(
        Math.pow(x - item.position.x, 2) + Math.pow(y - item.position.y, 2)
      )

      resultList[dist] = item;
    }

    const minKey = Math.min.apply(Math, Object.keys(resultList))
    return resultList[minKey] || null;
  }


  clone () {
    let params = Object.assign({}, this.startParams);
    params = Object.assign(params, {
      position: this.position,
      angle: this.angle
    });

		let newEntity = new Agent(params);
		newEntity.brain.dispose();
		newEntity.brain = this.brain.clone();

		return newEntity;
  }

  // crossover (partner) {
  //   let parentA_in_dna = this.brain.input_weights.dataSync();
  //   let parentA_out_dna = this.brain.output_weights.dataSync();
  //   let parentB_in_dna = partner.brain.input_weights.dataSync();
  //   let parentB_out_dna = partner.brain.output_weights.dataSync();

  //   let mid = Math.floor(Math.random() * parentA_in_dna.length);
  //   let child_in_dna = [...parentA_in_dna.slice(0, mid), ...parentB_in_dna.slice(mid, parentB_in_dna.length)];
  //   let child_out_dna = [...parentA_out_dna.slice(0, mid), ...parentB_out_dna.slice(mid, parentB_out_dna.length)];

  //   let child = this.clone();
  //   let input_shape = this.brain.input_weights.shape;
  //   let output_shape = this.brain.output_weights.shape;

  //   child.brain.dispose();

  //   child.brain.input_weights = tf.tensor(child_in_dna, input_shape);
  //   child.brain.output_weights = tf.tensor(child_out_dna, output_shape);

  //   return child;
  // }

  // mutate() {
  //   function fn(x) {
  //     if (random(1) < 0.05) {
  //       let offset = randomGaussian() * 0.5;
  //       let newx = x + offset;
  //       return newx;
  //     }
  //     return x;
  //   }

  //   let ih = this.brain.input_weights.dataSync().map(fn);
  //   let ih_shape = this.brain.input_weights.shape;
  //   this.brain.input_weights.dispose();
  //   this.brain.input_weights = tf.tensor(ih, ih_shape);

  //   let ho = this.brain.output_weights.dataSync().map(fn);
  //   let ho_shape = this.brain.output_weights.shape;
  //   this.brain.output_weights.dispose();
  //   this.brain.output_weights = tf.tensor(ho, ho_shape);
  // }

  add_to_world () {
    this.init()
  }

  // TODO: use food instead of score
  adjust_score() {
		// let score = this.upper_left_leg.position.x
		// this.score = score > 0 ? score : 0.001
	}

  // think(boundary) {
	// 	let ground = boundary.ground;
	// 	let distance_from_ground = ground.position.y - ((this.upper_left_leg.position.y + this.upper_right_leg.position.y + this.lower_right_leg.position.y + this.lower_left_leg.position.y) / 4)
	// 	let torque = this.upper_left_leg.angularVelocity + this.upper_right_leg.angularVelocity + this.lower_right_leg.angularVelocity + this.lower_left_leg.angularVelocity;
	// 	let vx = this.upper_left_leg.velocity.x + this.upper_right_leg.velocity.x + this.lower_right_leg.velocity.x + this.lower_left_leg.velocity.x;
	// 	let vy = this.upper_left_leg.velocity.y + this.upper_right_leg.velocity.y + this.lower_right_leg.velocity.y + this.lower_left_leg.velocity.y;

  //   let input = [distance_from_ground / width, vx / 4, vy / 4, torque / 4];

	// 	let result = this.brain.predict(input);

	// 	// this.move_m1(result[0]);
	// 	this.move_m2(result[0]);
	// 	this.move_m3(result[1]);
	// }


  async update () {
    const nearFood = this.getNearFood()
    let angleToFood = 0

    this.status = nearFood ? 'see_food' : ''

    if (nearFood) {
      let absAngleToFood = _angleBetweenPoints(this.position, nearFood.position)

      angleToFood = absAngleToFood - this.angle
      angleToFood = Math.abs(angleToFood) > _toRadians(270)
        ? (Math2PI - Math.abs(angleToFood)) * -1
        : angleToFood
    }


    const rawData = {
      isSeeFood: !!nearFood,
      angleToFood,
      distanceToFood: nearFood
        ? _distanceBetweenPoints(this.position, nearFood.position)
        : 0, // TODO: 0 or -1?
    };

    const normalisedData = this.normalizeBrainData(rawData);

    // console.log('rawData: ', rawData)
    // console.log('normalisedData: ', normalisedData)

    const input = [
      normalisedData.isSeeFood,
      normalisedData.angleToFood,
      normalisedData.distanceToFood,
    ]

    const result = await this.brain.predict(input)
    const denormalisedData = this.denormalizeBrainData(result)


    this.applyForce(denormalisedData.force)
    this.applyAngularForce(denormalisedData.angularForce)


    /**
     * TODO: To be continued...
     */


    // // let input = [distance_from_ground / width, vx / 4, vy / 4, torque / 4];
		// // let result = this.brain.predict(input);


    // var normalisedData   = this.normalizeBrainData(rawData);
    // var result = this.activateBrain(normalisedData);
    // // var result = this.getBrainSignal();
    // var denormalisedData = this.denormalizeBrainData(result);

    // // log('\nrawData', rawData)
    // // log('normalisedData', normalisedData)
    // // log('result', result)
    // // log('denormalisedData', denormalisedData)

    // this.angle(angle + denormalisedData.angle);
    // this.speed(denormalisedData.speed);
    // this.move();
  }

  normalizeBrainData (data) {
    if (data.distanceToFood === Infinity) data.distanceToFood = 0;

    let angleToFood = data.angleToFood / (1 / Math2PI)

    // round
    angleToFood = data.angleToFood
      ? Math.round(data.angleToFood * 1000) / 1000
      : 0 // TODO: 0 or -1?

    const distanceToFood = data.distanceToFood === 0
      ? 0
      : Math.round(1 / data.distanceToFood * 1000) / 1000

    return {
      isSeeFood: !!data.isSeeFood ? 1 : 0,
      angleToFood,
      distanceToFood
    };
  }

  /**
   * @param {array} input
   */
  denormalizeBrainData (input) {
    return {
      force: input[0],
      angularForce: input[1]
    };
  }


  bite (food) {
    if (!food) return
    food.destroy()
    // this.$body.m_force = Vec2.zero()
    this.incrementScore()
  }

  incrementScore() {
    this.score++
    // this.$element.get(2).text(new String(this._score));

    // if (this.group) {
      // this.group.incrementScore();
    // }
  }


  kill () {
    this.world.$body.destroyBody(this.$body)

		// Dispose its brain
		this.brain.dispose();
  }

}




/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} r - radius
 * @param {number} startAngle - in radians
 * @param {number} endAngle - in radians
 */
function _createVisionArcPath(x, y, r, startAngle, endAngle) {
  if(startAngle > endAngle){
    const s = startAngle;
    startAngle = endAngle;
    endAngle   = s;
  }
  if (endAngle - startAngle > Math.PI * 2 ) {
    endAngle = Math.PI * 1.99999;
  }

  const quarterAngle = _toDegrees(startAngle) / 2

  return [
    Vec2(x, y),
    Vec2(x + Math.cos(startAngle) * r, y - (Math.sin(startAngle) * r)),
    Vec2(x + Math.cos(_toRadians(360 - quarterAngle)) * r, y + (Math.sin(_toRadians(360 - quarterAngle)) * r)),
    Vec2(x + Math.cos(0) * r, y - (Math.sin(0) * r)),
    Vec2(x + Math.cos(_toRadians(quarterAngle)) * r, y + (Math.sin(_toRadians(quarterAngle)) * r)),
    Vec2(x + Math.cos(endAngle) * r, y - (Math.sin(endAngle) * r)),
    Vec2(x, y)
  ];
}






// const tests = [
//   {
//     id: 'test1',
//     agent: {x: 0, y: 0},
//     agentAngle: _toRadians(0),
//     food: {x: 20, y: 0},
//     foodAngle: _toRadians(0),
//     res: _toRadians(0)
//   },
//   {
//     id: 'test2',
//     agent: {x: 0, y: 0},
//     agentAngle: _toRadians(0),
//     food: {x: 20, y: -20},
//     foodAngle: _toRadians(315),
//     res: _toRadians(-45)
//   },
//   {
//     id: 'test3',
//     agent: {x: 0, y: 0},
//     agentAngle: _toRadians(0),
//     food: {x: 20, y: 20},
//     foodAngle: _toRadians(45),
//     res: _toRadians(45)
//   },

//   {
//     id: 'test4',
//     agent: {x: 0, y: 0},
//     agentAngle: _toRadians(90),
//     food: {x: 0, y: 20},
//     foodAngle: _toRadians(90),
//     res: _toRadians(0)
//   },
//   {
//     id: 'test5',
//     agent: {x: 0, y: 0},
//     agentAngle: _toRadians(90),
//     food: {x: 20, y: 20},
//     foodAngle: _toRadians(45),
//     res: _toRadians(-45)
//   },
//   {
//     id: 'test6',
//     agent: {x: 0, y: 0},
//     agentAngle: _toRadians(90),
//     food: {x: -20, y: 20},
//     foodAngle: _toRadians(135),
//     res: _toRadians(45)
//   },

//   {
//     id: 'test7',
//     agent: {x: 0, y: 0},
//     agentAngle: _toRadians(180),
//     food: {x: -20, y: 0},
//     foodAngle: _toRadians(180),
//     res: _toRadians(0)
//   },
//   {
//     id: 'test8',
//     agent: {x: 0, y: 0},
//     agentAngle: _toRadians(180),
//     food: {x: -20, y: 20},
//     foodAngle: _toRadians(135),
//     res: _toRadians(-45)
//   },
//   {
//     id: 'test9',
//     agent: {x: 0, y: 0},
//     agentAngle: _toRadians(180),
//     food: {x: -20, y: -20},
//     foodAngle: _toRadians(225),
//     res: _toRadians(45)
//   },

//   {
//     id: 'test10',
//     agent: {x: 0, y: 0},
//     agentAngle: _toRadians(270),
//     food: {x: 0, y: -20},
//     foodAngle: _toRadians(270),
//     res: _toRadians(0)
//   },
//   {
//     id: 'test11',
//     agent: {x: 0, y: 0},
//     agentAngle: _toRadians(270),
//     food: {x: -20, y: -20},
//     foodAngle: _toRadians(225),
//     res: _toRadians(-45)
//   },
//   {
//     id: 'test12',
//     agent: {x: 0, y: 0},
//     agentAngle: _toRadians(270),
//     food: {x: 20, y: -20},
//     foodAngle: _toRadians(315),
//     res: _toRadians(45)
//   },
// ]

// _food.position = {
//   x: this.position.x + tests[ind].food.x,
//   y: this.position.y + tests[ind].food.y
// }

// for (let test of tests) {
//   let absAngleToFood = _angleBetweenPoints(test.agent, test.food)
//   let angleToFood = absAngleToFood - test.agentAngle

//   angleToFood = Math.abs(angleToFood) > _toRadians(270)
//     ? (Math.PI * 2 - Math.abs(angleToFood)) * -1
//     : angleToFood

//   const isCorrect = test.foodAngle === absAngleToFood && test.res === angleToFood
//   const _log = isCorrect ? 'log' : 'error'

//   console[_log](
//     'TEST:', test.id,
//     '  absAngleToFood:', absAngleToFood, _toDegrees(absAngleToFood), '=> ' + _toDegrees(test.foodAngle),
//     '  angleToFood:', angleToFood, _toDegrees(angleToFood), '=> ' + _toDegrees(test.res),
//     ''
//   )
// }
